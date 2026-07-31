# Expert Panel — Test Cases

Branch: `test/expert-panel-unit-tests`

Run tests:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 1. Format utilities (`format.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| F-01 | `normalizeMongoId` | Trim string id | Returns trimmed value |
| F-02 | `normalizeMongoId` | Extended JSON `{ $oid }` | Returns oid string |
| F-03 | `normalizeMongoId` | Null / empty | Returns `""` |
| F-04 | `asDisplayString` | Number / boolean | `"42"`, `"Yes"`, `"No"` |
| F-05 | `normalizeIsoDate` | ISO string | Valid ISO output |
| F-06 | `normalizeIsoDate` | `{ $date }` | Parsed ISO |
| F-07 | `normalizeIsoDate` | Invalid string | `null` |
| F-08 | `formatAvgTurnaround` | Hours & days | `"5 hrs"`, `"2 Days"`, `"—"` |
| F-09 | `formatRequestId` | Long Mongo id | Last 8 chars uppercase |
| F-10 | History URL | `parseHistoryPeriod` | `"all"` default, `"month"` valid |
| F-11 | History URL | `parseHistoryReportParam` | Trim / reject empty |
| F-12 | History URL | `buildExpertHistoryHref` | Query params for report modal |
| F-13 | History filter | `isWithinHistoryPeriod` | `"all"` always true; null false for month |

## 2. Evaluation form (`evaluationForm.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| E-01 | Initial state | Empty form | All keys empty strings |
| E-02 | Legacy migration | Old field names | Mapped to API-aligned keys |
| E-03 | Price range | Combined range string | Split into min/max |
| E-04 | Price range | Min + max | `"₹5,000 – ₹15,000"` |
| E-05 | Progress | Empty form | 0% (0/16 required) |
| E-06 | Progress | Complete form | 100% (16/16 required) |
| E-07 | Submit gate | Missing required | Labels listed |
| E-08 | Submit gate | Complete form | No missing fields |
| E-09 | Section steps | Complete general | `"complete"` |
| E-10 | Section steps | Empty general | `"pending"` |

## 3. Report content fields (`reportContentFields.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| R-01 | `formToContentFields` | Full form | Nested `contentFields` for POST/PUT |
| R-02 | `contentFieldsToFormState` | API response | Flat form for UI |
| R-03 | Legacy content | Flat `content` only | Migrated to form keys |
| R-04 | Coin title | Form vs fallback | Form name wins |

## 4. JWT / report map helpers (`expertJwt.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| J-01 | JWT decode | Valid token | Payload object |
| J-02 | JWT decode | Malformed | `null` |
| J-03 | Expert id | `expertId` claim | Resolved id |
| J-04 | Expert id | `sub` fallback | Resolved id |
| J-05 | Report map entry | Valid pair | `{ requestId, reportId }` |
| J-06 | Report map merge | Over max entries | Oldest trimmed |
| J-07 | Proxy capture | POST report response | Extract request→report mapping |

## 5. Request mappers (`requestMappers.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| M-01 | Payload parse | Media groups | Obverse / Reverse items |
| M-02 | History row | Completed request | `view_report`, `completed` |
| M-03 | History row | Accepted request | `resume`, `draft` |
| M-04 | History row | Missed deadline | `view_details`, `missed` |
| M-05 | Queue list | Offers + accepted | Sorted by deadline |
| M-06 | Evaluation detail | Offered + offerId | `needsAccept: true` |
| M-07 | Evaluation detail | Accepted | `canSubmit: true` |

## 6. Report service (`reportsService.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| S-01 | Draft detection | `isDraft: true/false` | Correct boolean |
| S-02 | Report id extract | `request.reportId` from list API | Canonical id |
| S-03 | Report id extract | Embedded `report` object | `_id` used |
| S-04 | Local mapping | Remember / get | localStorage round-trip |
| S-05 | Get report | `GET /experts/reports/:id` | Full report returned |
| S-06 | History load | API `reportId` preferred | Calls GET with API id, not stale local |
| S-07 | Draft load | No API id | Falls back to stored draft id |
| S-08 | Resolve report | URL `?report=` | Direct GET by id |
| S-09 | Resolve report | `request.reportId` only | GET by id from request list |
| S-10 | Resolve report | No reference | `"Report reference is missing."` |

### Draft vs submit (`isDraft`) — API behaviour (manual / integration)

| ID | API call | `isDraft` | Expected backend behaviour |
|----|----------|-----------|----------------------------|
| D-01 | `POST /experts/reports` | `true` | Draft created; request stays `accepted` |
| D-02 | `PUT /experts/reports/:id` | `true` | Draft updated; still editable |
| D-03 | `PUT /experts/reports/:id` | `false` | Report submitted; request `completed` |
| D-04 | `POST /experts/reports` | `false` | Final submit without prior draft |
| D-05 | Submit validation | `false` + missing fields | 400 from backend |

## 7. Report display (`evaluationReportView.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| V-01 | Report modal | `buildEvaluationReportDisplay` | Sections from `contentFields` |
| V-02 | Report modal | Market section | Combined price range shown |
| V-03 | Media groups | Group by label | Obverse / Reverse buckets |
| V-04 | Submitted date | Valid / null ISO | Formatted / `"—"` |

## 8. Local draft storage (`evaluationDraftStorage.test.ts`)

| ID | Feature | Test case | Expected |
|----|---------|-----------|----------|
| L-01 | Load draft | No saved data | `null` |
| L-02 | Save draft | Form state | Round-trip in localStorage |
| L-03 | Clear draft | After clear | `null` |

## Coverage scope

Unit tests target pure logic in `src/lib/expert/`:

- Form validation & `contentFields` mapping
- History / queue / draft mappers
- Report lookup (`reportId` from requests → `GET /experts/reports/:id`)
- JWT report-map helpers for proxy persistence

Excluded from unit coverage (integration / browser):

- `apiClient.ts` (network)
- `evaluationReportExport.ts` (jsPDF / canvas)
- `useExpertQueuePolling.ts` (React hooks + timers)
- `reportMapStore.server.ts` (Netlify Blobs / filesystem)

## Future integration tests (not in this branch)

- Login → accept offer → save draft → submit → history view report
- Cross-device history when `reportId` present on `GET /experts/me/requests`
- PDF download end-to-end
