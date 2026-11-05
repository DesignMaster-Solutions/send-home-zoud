#!/bin/zsh
# Screenshots of the published build on a real device, for CONCEPT.md / the itch page.
# Usage: docs/shots.sh [device] [prefix]   e.g. docs/shots.sh redmi m2   (files land in docs/shots/<prefix>-*-<device>.png)
set -euo pipefail
D=${1:-redmi}; P=${2:-m2}; U=https://designmaster-solutions.github.io/send-home-zoud/
O=${0:A:h}/shots; shot() { browse $D shot "$O/$P-$1-$D.png" >/dev/null; print "$O/$P-$1-$D.png"; }
browse $D open "${U}?seed=7&lang=en&v=$RANDOM" >/dev/null
browse $D wait --text "SEND HOME" 20 >/dev/null; browse $D wait 2 >/dev/null 2>&1 || true; shot title
browse $D click --text "Start the year" >/dev/null; browse $D wait --text "Payday 1 of 12" 10 >/dev/null; shot payday
browse $D click --text "Go to the street" >/dev/null; browse $D wait --text "Mid-market rate today" 10 >/dev/null; shot street
browse $D click '[data-c=saffron]' >/dev/null; browse $D wait --text "your family receives" 10 >/dev/null
browse $D click --text "Send here" >/dev/null; browse $D wait --text "Your family receives" 10 >/dev/null
browse $D js 'return new Promise(r => setTimeout(() => r(1), 1500))' >/dev/null; shot receipt
browse $D click --text "Next" >/dev/null; browse $D wait --text "News from home" 10 >/dev/null
browse $D js 'return new Promise(r => setTimeout(() => r(1), 2500))' >/dev/null; shot news
browse $D open "${U}?seed=7&lang=en&autoplay&fast&a11y=calm&v=$RANDOM" >/dev/null
browse $D wait --text "The year is over" 90 >/dev/null; shot end
browse $D open "${U}?seed=7&lang=ar&v=$RANDOM" >/dev/null
browse $D wait --text "ابدأ السنة" 20 >/dev/null; browse $D click '[data-act=start]' >/dev/null
browse $D wait '[data-act=street]' 10 >/dev/null; browse $D click '[data-act=street]' >/dev/null
browse $D wait '.counter' 10 >/dev/null; shot street-ar
