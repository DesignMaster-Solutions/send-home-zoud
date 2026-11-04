#!/bin/zsh
# End-to-end on a real device: one payday through the published build (split, street, quote, receipt, news).
# Usage: tests/e2e.sh [device] [url]   e.g. tests/e2e.sh redmi https://designmaster-solutions.github.io/send-home-zoud/
set -euo pipefail
D=${1:-livre}; U=${2:-https://designmaster-solutions.github.io/send-home-zoud/}
fail() { print -u2 "E2E FAIL: $*"; exit 1; }
browse $D open "${U}?seed=7&lang=en&v=$RANDOM" >/dev/null
browse $D wait --text "SEND HOME" 20 >/dev/null || fail "title"
browse $D click --text "Start the year" >/dev/null
browse $D wait --text "Payday 1 of 12" 10 >/dev/null || fail "payday"
W=$(browse $D js 'return Math.max(...[...document.querySelectorAll(".actions")].map(a => a.scrollWidth - a.clientWidth))')
[[ $W -le 0 ]] || fail "payday action row overflows by ${W}px"
browse $D click --text "Go to the street" >/dev/null
browse $D wait --text "Mid-market rate today" 10 >/dev/null || fail "street"
[[ $(browse $D js 'return document.querySelectorAll(".counter").length') -ge 4 ]] || fail "counters"
browse $D click '[data-c=saffron]' >/dev/null
browse $D wait --text "your family receives" 10 >/dev/null || fail "quote"
browse $D click --text "Send here" >/dev/null
browse $D wait --text "Your family receives" 10 >/dev/null || fail "receipt"
R=$(browse $D text .receipt)
[[ $R == *"Total cost"* && $R == *"₹"* && $R == *"3.68%"* ]] || fail "receipt lines: $R"
W=$(browse $D js 'return document.documentElement.scrollWidth - innerWidth')
[[ $W -le 0 ]] || fail "page wider than the screen by ${W}px"
browse $D click --text "Next" >/dev/null
browse $D wait --text "News from home" 10 >/dev/null || fail "news"
# Arabic: the same street reads right to left
browse $D open "${U}?seed=7&lang=ar&v=$RANDOM" >/dev/null
browse $D wait --text "ابدأ السنة" 20 >/dev/null || fail "arabic title"
[[ $(browse $D js 'return document.documentElement.dir') == rtl ]] || fail "rtl"
# A whole year, played by ?autoplay at 12x: every payday, street and receipt renders and the year ends.
browse $D open "${U}?seed=7&lang=en&autoplay&fast&a11y=calm&v=$RANDOM" >/dev/null
browse $D wait --text "The year is over" 90 >/dev/null || fail "autoplay year did not end: $(browse $D text | head -5)"
E=$(browse $D text .stats)
[[ $E == *"Needs paid at home"* ]] || fail "end stats: $E"
print "end: $(browse $D text .ending)"
print "E2E OK on $D"
