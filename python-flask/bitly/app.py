import os
import random

from flask import Flask, send_from_directory, request, redirect
import psycopg2

import logging
logging.basicConfig(level=logging.INFO)

db_settings = {
    'host': os.environ['PGHOST'],
    'database': os.environ['PGDATABASE'],
    'user': os.environ['PGUSER'],
    'password': os.environ['PGPASSWORD'],
    'port': os.environ['PGPORT']
}

def query_db_all():
    conn = psycopg2.connect(**db_settings)
    cur = conn.cursor()
    cur.execute("SELECT * FROM urls;")
    urls = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    return urls

def query_db_original(original):
    conn = psycopg2.connect(**db_settings)
    cur = conn.cursor()
    cur.execute("SELECT * FROM urls WHERE original = %s;", (original,))
    urls = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    return urls

def query_db_shortened(shortened):
    conn = psycopg2.connect(**db_settings)
    cur = conn.cursor()
    cur.execute("SELECT * FROM urls WHERE shortened = %s;", (shortened,))
    urls = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    return urls

def insert_db(original, shortened):
    conn = psycopg2.connect(**db_settings)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO urls (original, shortened) VALUES (%s, %s);", 
        (original, shortened)
    )
    conn.commit()
    cur.close()
    conn.close()

def make_shorten_url():
    url_length = 4
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return ''.join([random.choice(characters) for _ in range(url_length)])

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/random')
def random_url():
    query = query_db_all()
    if not query:
        return 'No URLs in the DB yet.', 400

    random_url = random.choice(query)[1]
    app.logger.info(f'random redirect to {random_url}')
    return redirect(random_url)

@app.route('/<shortened_url>')
def redirect_to_original(shortened_url):
    query = query_db_shortened(shortened_url)
    if not query:
        return 'No URLs in the DB yet.', 400

    return redirect(query[0][1])

@app.route('/shorten_url', methods=['POST'])
def shorten_url():
    original_url = request.form['original_url']
    if not original_url:
        return 'URL is an empty string.', 400

    # check if original url already in db
    query = query_db_original(original_url)
    if not query:
        shortened_url = make_shorten_url()
        while query_db_shortened(shortened_url):
            app.logger.info('shortened url collision, regenerating...')
            shortened_url = make_shorten_url()

        # insert the original-shortened pair into db
        app.logger.info('inserting url...')
        app.logger.info(f'original url: {original_url}');
        app.logger.info(f'shortened url: {shortened_url}');
        insert_db(original_url, shortened_url)
    else:
        shortened_url = query[0][2]

    return shortened_url, 200
