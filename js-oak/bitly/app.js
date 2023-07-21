import { Application, Router, Status, Client } from "./deps.js";

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

const index = async ({ response }) => {
  response.type = "text/html";
  response.body = await Deno.readTextFile("static/index.html");
};

const random = async ({ response }) => {
  const query = await query_db_all();
  if (query.length === 0) {
    response.body = "No URLs in the DB yet.";
    response.status = Status.BadRequest;
    return;
  }

  const random_url = query[Math.floor(Math.random() * query.length)];

  console.log('random redirect to', random_url.original);
  response.status = Status.Found;
  response.redirect(random_url.original);
};

const redirect_to_original = async ({ params, response }) => {
  const query = await query_db_shortened(params.shortened_url);
  if (query.length === 0) {
    response.body = "No such URL in the DB.";
    response.status = Status.BadRequest;
    return;
  }

  response.status = Status.Found;
  response.redirect(query[0].original);
};

const shorten_url = async ({ request, response }) => {
  const formData = await request.body().value;
  console.log('formData:', formData);
  const original_url = await formData.get("original_url");
  var shortened_url = '';

  // check if original url is empty
  if (original_url === "") {
    response.body = "URL is an empty string."
    response.status = Status.BadRequest;
    return;
  }

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

  response.body = shortened_url;
};

const router = new Router();
router.get("/", index);
router.get("/random", random);
router.get("/:shortened_url", redirect_to_original);
router.post("/shorten_url", shorten_url);

const app = new Application();
app.use(router.routes());
app.listen({ port: 7777 });
