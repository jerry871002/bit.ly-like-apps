# Project 1 report

## Get Started

There are three implementations in this project, which is quite self-explanatory by the names of the folders. To run the application, first `cd` into one of the application folders (`js-vanilla-deno`, `js-oak`, or `python-flask`), then use `docker compose up --build` to start the application. Note that you might have to wait for up to 20 seconds until the application is fully started. Once the application is fully started, visit [http://127.0.0.1:7777](http://127.0.0.1:7777) to try the application.

The index page is quite simple, you can input a URL and click the "shorten!" button, and then you will see a page with the shortened version of this URL. Append that shortened code to the domain name, e.g. if you see `J10D` on the page, you can now visit the original site using `http://127.0.0.1:7777/J10D`.

After you shorten some URLs, you can also try [http://127.0.0.1:7777/random](http://127.0.0.1:7777/random), which brings you to a random site from the sites you just entered.

If you want to try another implementation, remember to first `docker compose down` the previous one since they use the same names for containers.

## Run Performance Tests

Before running the performance tests, there are two prerequisites
- One of the implementations is running
- `k6` is installed on your local (see [here](https://k6.io/docs/get-started/installation/) for more detail)

`cd` into the `tests/` directory, you can use `./test.sh` to run all the tests at once (remember to make sure that `test.sh` is an executable) or run the test one-by-one by `k6 run <test-name>.js` (check the content of `test.sh` to find out what exact test you can run).

## Results of Performance Tests

### Main Page

| Implementation | Avg requests per sec | Median | 95th percentile | 99th percentile |
|----------------|---------------------:|-------:|----------------:|----------------:|
| Vanilla Deno (JS) | 18.668860 | 48.05ms | 345.42ms | 346.35ms |
| Oak (JS) | 18.957057 | 42.46ms | 206.89ms | 208.02ms |
| Flask (Python) | 19.242928 | 37.91ms | 54.27ms | 59.71ms |

### Post Request

| Implementation | Avg requests per sec | Median | 95th percentile | 99th percentile |
|----------------|---------------------:|-------:|----------------:|----------------:|
| Vanilla Deno (JS) | 19.026033 | 35.43ms | 109ms | 254.11ms |
| Oak (JS) | 18.724850 | 50.76ms | 292.74ms | 329.17ms |
| Flask (Python) | 19.223982 | 37.59ms | 63.37ms | 94.13ms |

### Redirect

| Implementation | Avg requests per sec | Median | 95th percentile | 99th percentile |
|----------------|---------------------:|-------:|----------------:|----------------:|
| Vanilla Deno (JS) | 29.1717670 | 25ms | 235.7ms | 943.92ms |
| Oak (JS) | 31.2197410 | 24.81ms | 404.31ms | 973.87ms |
| Flask (Python) | 33.766364 | 22.71ms | 145.45ms | 575.43ms |

### Random

| Implementation | Avg requests per sec | Median | 95th percentile | 99th percentile |
|----------------|---------------------:|-------:|----------------:|----------------:|
| Vanilla Deno (JS) | 34.196923 | 25.26ms | 84.91ms | 410.39ms |
| Oak (JS) | 31.832867 | 28.06ms | 204.52ms | 624.45ms |
| Flask (Python) | 26.674346 | 22.72ms | 52.32ms | 211.23ms |

## Reflection

From the experimental results above, we can find that "Main Page" and "Post Request" have similar performance; the reason behind this might be that they both need to return some content and display it. On the other hand, the performance of "Redirect" and "Random" is akin since they are basically doing the same thing, i.e. redirecting the user to another URL, except that "Random" choose the URL randomly and "Redirect" choose it according to the given shortened one.

As for performance differences between frameworks, Vanilla Deno and Oak do not have much difference since they are based on the same platform. Nevertheless, Flask has slightly better performance, especially in the worst case scenario (99th percentile); the reason is still unclear and requires further study to answer.

To improve the performance, take the Flask framework as an example, the first thing we can do is to replace the development server into a standalone WSGI server (such as Gunicorn) and a proxy Nginx server. Also, Flask doesn’t support caching out of the box, you can add caching to the app to improve the performance.