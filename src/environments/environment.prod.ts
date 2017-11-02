import * as mixpanel from 'mixpanel-browser';
mixpanel.init("7414766e68b2f682c8497b567ea9a997");

export const environment = {
  production: true,
  mixpanel: mixpanel
};

// GA
(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date().getTime(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

(window as any).ga('create', 'UA-109027550-2', 'none');
(window as any).ga('send', 'pageview');