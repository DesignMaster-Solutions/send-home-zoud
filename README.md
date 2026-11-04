# Send Home (working title)

Second entry by Design Master Solutions to [Zoud GameLab](https://itch.io/jam/zoud-gamelab) (theme: Make FinLit Fun; jam closes 15/11/2026 23:59 AoE). Our first entry is [Snowball](https://designmastersolutions.itch.io/snowball) (compound growth over a lifetime). This one is about the money that leaves the UAE every payday.

## The idea

You work in Dubai and your family lives in another country. Every payday the salary lands and you split it three ways: life here (rent, food, transport), a safety net, and the transfer home. Then you go and send it.

The street of exchange counters and apps is the game board. Every counter shows a fee and a rate, and the loud ones shout "ZERO FEE". The only number that matters is what your family **receives**, and the player learns to read it fast, before the Friday queue moves on. A friend of a friend on the phone offers a better rate in cash, no receipt. Messages from home arrive between paydays: school fees, a roof before the rains, a cousin's wedding, a hospital bill.

Trade-offs the player feels instead of reads:

- **Fee vs. rate**: a zero-fee counter with a worse rate costs more than a small fee at a fair rate. Compare against the mid-market rate.
- **Often vs. batched**: sending small amounts every week pays the fixed fee every time; waiting saves fees but home cannot always wait.
- **Send more vs. keep a cushion**: sending everything leaves nothing for your own emergency here, and the emergency always comes.
- **Formal vs. informal**: the unlicensed offer is cheaper until the day the money never arrives.

Twelve paydays make one run (about 8 minutes). The ending depends on what reached home and whether you were still standing at the end of the year.

## Rubric map (official Zoud GameLab rubric)

| Criterion | Points | How this entry answers it |
|---|---|---|
| Prototype & Gameplay | 25 | one clear loop (split, go to the street, pick, read the receipt), timer pressure from the queue, 12 paydays with rising stakes, more than one good ending |
| Financial Literacy Integration | 25 | the lesson is the mechanic: total cost = fee + exchange-rate margin, read "they receive", batching, emergency fund, licensed channels |
| Educational Impact | 15 | a receipt at the end of each transfer and a year summary in money that reached home vs. money lost to costs |
| Creativity & Innovation | 15 | of the 30 entries in the jam on 04/11/2026, five mention money sent home, as a budget line or an event (My DUNYA, Smart Phone: Money or Likes?, Rainy Day, ZARF Twelve Paydays, Future Me); none is built around the transfer itself: choosing the channel, fee plus exchange-rate margin against the mid-market rate, the receipt, batching, the informal channel. They treat money for home as a budget line; Send Home makes the transfer the game, and the board is a street of counters, not a spreadsheet |
| Development & Commercial Potential | 20 | concept doc and budget; path to partners that publish real corridor costs |
| Localization bonus (UAE / Arab region) | up to 5 | English and Arabic (RTL), AED, corridors that matter to people living in the UAE |
| Inclusivity & Accessibility bonus | up to 5 | large text, high contrast, calm speed (no timer), plain words, sound off, pause |

## Required for the development funding (jam page)

1. The game, playable in the browser, on an itch.io page submitted to the jam.
2. Concept doc / initial game design document (official 6-section template, PDF).
3. 2-minute video of actual gameplay of the submitted build.
4. Game budget.
5. AI use disclosed in the submission form.

## Facts and sources

Every real-world number the game shows comes from a public source listed here. Counters and apps in the game are fictional; no real company is named or rated. The player's salary, bills, family needs and the counters' fees are game values, not statistics.

| Shown in the game | Value | Source |
|---|---|---|
| Average total cost of sending AED 735 (about USD 200) from the UAE, Q1 2025 | India 3.68%, Pakistan 1.42%, Philippines 3.04% | World Bank, Remittance Prices Worldwide dataset 2011-2025 Q1, [rpw_dataset_2011_2025_q1.xlsx](https://remittanceprices.worldbank.org/sites/default/files/rpw_dataset_2011_2025_q1.xlsx) (simple mean of the providers surveyed; our parse in [docs/rpw-uae-q1-2025.txt](docs/rpw-uae-q1-2025.txt)) |
| UAE banks cost more than money transfer operators (AED 735 to India: banks 8.02%, operators 2.81%) | used to set the game's bank fee | same dataset |
| UN goal: remittance costs under 3% by 2030 | SDG target 10.c: "By 2030, reduce to less than 3 per cent the transaction costs of migrant remittances and eliminate remittance corridors with costs higher than 5 per cent." | [UN SDG indicator metadata 10.c.1](https://unstats.un.org/sdgs/metadata/files/Metadata-10-0c-01.pdf) |
| Global average cost of sending USD 200: 6.36% (Q3 2025) | for the concept doc | [RPW Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) |
| Personal remittances paid from the UAE: USD 62.1 billion in 2025 | for the concept doc | [World Bank WDI, BM.TRF.PWKR.CD.DT](https://data.worldbank.org/indicator/BM.TRF.PWKR.CD.DT?locations=AE) |
| Mid-market rate, 1 AED = 25.82 INR, 75.36 PKR, 17.30 PHP | fixed for the game on 04/11/2026 | [open.er-api.com/v6/latest/AED](https://open.er-api.com/v6/latest/AED) (aggregator, not a central bank) |
| The counters close for Friday prayer at 13:15 | the street clock | UAE unified Friday prayer time since January 2022 (to be linked to the u.ae page before submission) |

Game rules that are not facts, and say so in the code (`econ.js`): a 1 in 5 chance that an informal transfer never arrives, a 10% charge on a salary advance, 15% of money left idle at home going on everyday things, the salary paid a month late once a year.

## License

Code MIT. Assets original or credited in this file.
