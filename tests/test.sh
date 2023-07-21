k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95),p(99),count" test_main_page.js
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95),p(99),count" test_post.js
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95),p(99),count" test_redirect.js
k6 run --summary-trend-stats="avg,min,med,max,p(90),p(95),p(99),count" test_random.js
