FROM python:3.10.8-alpine3.16

EXPOSE 7777

WORKDIR /app

COPY . .

RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

CMD [ "flask", "run", "--host=0.0.0.0", "--port=7777" ]