import { serve, serveFile, Client } from "./deps.js";

const env = Deno.env.toObject();
console.log("env:", env);

const client = new Client({
  hostname: env.PGHOST,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  port: env.PGPORT,
});
await client.connect();

const query_db_all = async () => {
  const result = await client.queryObject("SELECT * FROM urls;");
  return result.rows;
}

const query_db_original = async (original) => {
  const result = await client.queryObject(
    "SELECT * FROM urls WHERE original = $original;",
    { original: original }
  );

  return result.rows;
}

const query_db_shortened = async (shortened) => {
  const result = await client.queryObject(
    "SELECT * FROM urls WHERE shortened = $shortened;",
    { shortened: shortened }
  );

  return result.rows;
}

const insert_db = async (original, shortened) => {
  await client.queryObject(
    "INSERT INTO urls (original, shortened) VALUES ($original, $shortened);",
    {
      original: original,
      shortened: shortened
    }
  );
}

const make_shorten_url = () => {
  const url_length = 4;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  var result = "";
  for (var i = 0; i < url_length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

const handleRequest = async (request) => {
  console.log("Bitly server get request:", request.url);

  const pathname = new URL(request.url).pathname;

  if (request.method == "GET") {
    if (pathname === "/") {
      return await serveFile(request, "static/index.html");
    } else if (pathname === "/random") {
      const query = await query_db_all();
      if (query.length === 0) {
        return new Response("No URLs in the DB yet.");
      }

      const random_url = query[Math.floor(Math.random() * query.length)];

      console.log('random redirect to', random_url.original);
      return Response.redirect(random_url.original, 302);
    } else {
      const query = await query_db_shortened(pathname.replace("/", ""));
      if (query.length === 0) {
        return new Response("No such URL in the DB.");
      }

      return Response.redirect(query[0].original, 302);
    }
  } else if (
    request.method == "POST" &&
    pathname === "/shorten_url"
  ) {
    const formData = await request.formData();
    const original_url = formData.get("original_url");
    var shortened_url = '';

    // check if original url already in db
    var query = await query_db_original(original_url);
    if (query.length === 0) {
      // check if shortened url already in db
      shortened_url = make_shorten_url();
      while ((await query_db_shortened(shortened_url)).length !== 0) {
        console.log('shortened url collision, regenerating...')
        shortened_url = make_shorten_url();
      }

      // insert the original-shortened pair into db
      console.log('inserting url...')
      console.log('original url:', original_url);
      console.log('shortened url:', shortened_url);
      await insert_db(original_url, shortened_url);
    } else {
      shortened_url = query[0].shortened;
    }

    return new Response(shortened_url);
  }

  return new Response("Page not found.");
};

serve(handleRequest, { port: 7777 });
