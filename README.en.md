<div align="center">
  <img src="assets/images/legacy/idx_02.png" width="88" alt="Huaxiaozhu logo">
  <h1>Huaxiaozhu · Helping Skills Lab</h1>
  <p><strong>An offline, transparent, and self-hostable helping-skills training prototype</strong></p>
  <p>
    <a href="README.md">简体中文</a>
    ·
    <a href="README.en.md">English</a>
  </p>
  <p>
    <a href="https://github.com/wsLuYao/huaxiaozhu-helping-skills/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/wsLuYao/huaxiaozhu-helping-skills/actions/workflows/ci.yml/badge.svg"></a>
    <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-26a0a7.svg"></a>
    <img alt="Node 18+" src="https://img.shields.io/badge/Node.js-18%2B-3c873a.svg">
    <img alt="Static app" src="https://img.shields.io/badge/runtime-static_HTML-244b58.svg">
    <img alt="No cloud required" src="https://img.shields.io/badge/data-local_only-6956c8.svg">
  </p>
</div>

> [!IMPORTANT]
> Feedback is produced by **local keyword matching and explicit heuristics** in the browser. This project does not call an LLM and does not provide psychological assessment, diagnosis, counselling, or professional supervision.

![Huaxiaozhu desktop dashboard](docs/screenshots/dashboard.png)

## What it does

Huaxiaozhu turns the learning loop—guide, practise, receive feedback, and reflect—into a static web app. It needs no backend, database, or cloud account.

| Area | Current implementation |
| --- | --- |
| Skill guides | Restatement, feeling reflection, empathy synthesis, interpretation, confrontation, and action planning |
| Scenario practice | Simulated cases, multi-turn responses, and retries for all six skills |
| Local feedback | Explicit rules for fact coverage, response length, judgemental wording, and basic response form |
| Self-reflection | Two learning-oriented questionnaires with autosave, dimension results, and practice suggestions |
| Progress | Local practice history, trend charts, details, and print styles |
| Responsive UI | Mobile bottom navigation and a desktop sidebar |

The interface and learning content are currently in Simplified Chinese.

## Quick start

[Node.js 18+](https://nodejs.org/) is required for the included local server. There are no npm dependencies to install.

~~~bash
git clone https://github.com/wsLuYao/huaxiaozhu-helping-skills.git
cd huaxiaozhu-helping-skills
npm start
~~~

Open <http://127.0.0.1:8080> and choose the guest experience. You can also deploy the repository as-is to any static host.

## How it works

~~~mermaid
flowchart LR
  A[Learning guide] --> B[Simulated dialogue]
  B --> C[Local rule evaluator]
  C --> D[Practice result]
  D --> E[(LocalStorage)]
  E --> F[History and trends]
  G[Self-reflection] --> E
~~~

- Presentation: 17 explicit HTML entry points.
- Application: framework-free JavaScript under `window.HXZ`.
- Content: guides, cases, and questions in `assets/js/data.js`.
- Charts: vendored Apache ECharts 5.3.2.
- Persistence: browser LocalStorage only; there is no sync service.

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/training-session.png" alt="Scenario practice"><br><sub>Scenario practice</sub></td>
    <td width="50%"><img src="docs/screenshots/records.png" alt="Practice history"><br><sub>History and trends</sub></td>
  </tr>
</table>

<details>
<summary>View the mobile dashboard</summary>
<p align="center"><img src="docs/screenshots/mobile-dashboard.png" width="300" alt="Mobile dashboard"></p>
</details>

## Limits of the feedback

The evaluator lives in `assets/js/pages-training.js`. It matches case facts and prompt terms, then considers explicit features such as length and judgemental or prescriptive phrases. These rules are readable and editable, which makes them useful for teaching prototypes and interaction research.

They do **not** understand a real client, measure a learner's competence, or replace human supervision. Questionnaire results only suggest practice directions and are not scores from clinically validated instruments. Do not use this project for emergency, clinical, or high-risk decisions.

## Data and privacy

- Sign-in details, answers, questionnaire progress, and records stay in the current browser.
- The app loads no CDN resources and does not upload data.
- Clear the site's browser storage, or use the in-app clear-data action, to remove records.
- The demo sign-in is not a secure account system. Never reuse a real password or enter sensitive data.

See the [data and privacy notes](docs/data-and-privacy.zh-CN.md) (Chinese).

## Repository layout

~~~text
.
├── *.html                     # 17 static pages
├── assets/
│   ├── css/                   # Components, pages, and responsive styles
│   ├── images/                # Project artwork and OSS-edition SVGs
│   ├── js/                    # Content, application core, and controllers
│   └── vendor/echarts.min.js  # Local chart dependency
├── docs/                      # Architecture, deployment, privacy, screenshots
├── scripts/serve.mjs          # Dependency-free local static server
└── tests/static-check.mjs     # Syntax, reference, and regression checks
~~~

## Validation

~~~bash
npm test
~~~

The suite checks JavaScript syntax, local references across all 17 pages, external runtime requests, proprietary-font remnants, and regressions around modal listeners, record filters, chart disposal, and the rule evaluator. CI runs the same command for every push and pull request.

## Documentation

- [Architecture and implementation](docs/architecture.zh-CN.md) (Chinese)
- [Static deployment](docs/deployment.zh-CN.md) (Chinese)
- [Data and privacy](docs/data-and-privacy.zh-CN.md) (Chinese)
- [Third-party resources](docs/third-party.zh-CN.md) (Chinese)

## Contributing

Contributions are welcome. Please read the [contribution guide](CONTRIBUTING.md), [security policy](SECURITY.md), and [code of conduct](CODE_OF_CONDUCT.md) first.

## License

Original code and OSS-edition illustrations are available under the [MIT License](LICENSE). See [NOTICE](NOTICE.md) for Apache ECharts and trademark boundaries.

<div align="center">
  <sub>Built for learning and research · 为学习与研究而构建</sub>
</div>
