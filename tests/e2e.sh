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
# the amount buttons set the slider (a playtester never found the slider on its own)
browse $D click "[data-amt]" >/dev/null || fail "no amount buttons"
[[ $(browse $D js 'return document.querySelector("#amt").value === document.querySelector("[data-amt]").dataset.amt ? 1 : 0') == 1 ]] || fail "Enough did not set the slider"
W=$(browse $D js 'const r = document.querySelector("[data-amt]").parentElement; return r.offsetHeight > 2 * r.firstElementChild.offsetHeight ? 99 : 0')
[[ $W -le 0 ]] || fail "amount buttons wrap to a second line"
browse $D click --text "Go to the street" >/dev/null
browse $D wait --text "Mid-market rate today" 10 >/dev/null || fail "street"
[[ $(browse $D js 'return document.querySelectorAll(".counter").length') -ge 4 ]] || fail "counters"
[[ $(browse $D js 'return [...document.querySelectorAll(".counter")].every(c => c.querySelector("svg.facade")) ? 1 : 0') == 1 ]] || fail "a counter has no facade"
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
[[ $(browse $D js 'return document.querySelector(".flight .arrived")?.textContent || ""') == *"₹"* ]] || fail "no coin flight with the amount that arrived"
# From payday 2 the clock ticks: it must not rebuild the counters (Chrome drops a click whose pressed button was removed).
browse $D open "${U}?seed=7&lang=en&v=$RANDOM" >/dev/null
browse $D wait --text "SEND HOME" 20 >/dev/null
browse $D click --text "Start the year" >/dev/null
browse $D wait --text "Payday 1 of 12" 10 >/dev/null
browse $D click "[data-amt]" >/dev/null
browse $D click --text "Go to the street" >/dev/null
browse $D wait --text "Mid-market rate today" 10 >/dev/null
browse $D click '[data-c=saffron]' >/dev/null
browse $D wait --text "your family receives" 10 >/dev/null
browse $D click --text "Send here" >/dev/null
browse $D wait --text "Your family receives" 10 >/dev/null
browse $D click --text "Next" >/dev/null
browse $D wait --text "News from home" 10 >/dev/null
browse $D click '[data-act=next]' >/dev/null
browse $D wait --text "Payday 2 of 12" 10 >/dev/null || fail "payday 2"
browse $D click "[data-amt]" >/dev/null
browse $D click --text "Go to the street" >/dev/null
browse $D wait --text "Mid-market rate today" 10 >/dev/null || fail "street with a clock"
T0=$(browse $D text '.panel b')
browse $D js 'document.querySelector(".counter:not([disabled])").dataset.mark = 1; return 1' >/dev/null
sleep 2.5
[[ $(browse $D js 'return document.querySelectorAll("[data-mark]").length') == 1 ]] || fail "the clock rebuilt the counters"
[[ $(browse $D text '.panel b') != $T0 ]] || fail "the clock did not tick: $T0"
browse $D click '[data-mark]' >/dev/null
browse $D wait --text "your family receives" 10 >/dev/null || fail "no quote after the clock ticked"
# Arabic: the same street reads right to left
browse $D open "${U}?seed=7&lang=ar&v=$RANDOM" >/dev/null
browse $D wait --text "ابدأ السنة" 20 >/dev/null || fail "arabic title"
[[ $(browse $D js 'return document.documentElement.dir') == rtl ]] || fail "rtl"
# ?caption (the gameplay video) says what is happening
browse $D open "${U}?seed=5&lang=en&autoplay&caption&v=$RANDOM" >/dev/null
browse $D wait --text "One year, twelve paydays" 20 >/dev/null || fail "caption on the title"
browse $D wait --text "choose what to send home" 20 >/dev/null || fail "caption on payday 1"
# A whole year, played by ?autoplay at 12x: every payday, street and receipt renders and the year ends.
browse $D open "${U}?seed=7&lang=en&autoplay&fast&a11y=calm&v=$RANDOM" >/dev/null
browse $D wait --text "The year is over" 90 >/dev/null || fail "autoplay year did not end: $(browse $D text | head -5)"
E=$(browse $D text .stats)
[[ $E == *"Needs paid at home"* && $E == *"Months the family went short"* ]] || fail "end stats: $E"
[[ $(browse $D text .truth) == *"Wage Protection System"* ]] || fail "no What is true in the UAE panel"
print "end: $(browse $D text .ending)"
# Large text really makes text larger (rem sizes follow <html>)
browse $D open "${U}?seed=7&lang=en&a11y=large&v=$RANDOM" >/dev/null
browse $D wait --text "SEND HOME" 20 >/dev/null
[[ $(browse $D js 'return getComputedStyle(document.documentElement).fontSize') == 21px ]] || fail "large text did not change the size"
print "E2E OK on $D"
