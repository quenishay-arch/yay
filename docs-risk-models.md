## Risk Models & Exception Rules

This document specifies the **initial rule-based exceptions** and **data features** for the first delay and quality-risk models powering TraceLoom’s control tower.

---

### 1. Risk Categories

We focus on three primary risk categories:

1. **Schedule / Delay Risk** – probability that a PO misses its required ship or delivery window.
2. **Quality Risk** – probability that a PO fails QA or triggers rework/returns.
3. **Disruption Risk** – risk of disruption due to external conditions (weather, port congestion, transport issues).

Each PO has:

- A **risk level**: `Low`, `Medium`, `High`.
- An **on-time probability** estimate (0–100%).
- Explanatory **reason codes** attached to alerts.

---

### 2. Baselines and Features

#### 2.1 Baseline Calculations

For each relevant dimension, compute **historical baselines**:

- Dimensions:
  - `lane` (origin → destination).
  - `supplierId` / `factoryId`.
  - `productType` / `category`.
  - `season` (e.g., FW26, SS27).

- Metrics:
  - Manufacturing cycle times:
    - `yarnLeadTimeBaseline` (supplier dispatch → yarn received).
    - `knittingDurationBaseline`.
    - `dyeingDurationBaseline`.
    - `qaLeadTimeBaseline`.
  - Logistics cycle times:
    - `portDwellBaseline` (gate-in → vessel departure).
    - `transitTimeBaseline` (departure → arrival).
  - Quality:
    - `defectRateBaseline` per factory/productType.
    - `reworkRateBaseline`.

These baselines are stored and refreshed periodically (e.g., nightly).

#### 2.2 Core Features per PO

For each open PO, derive a feature vector that includes:

- **Progress features**
  - `pctStagesCompleted` (0–1).
  - `daysUntilShipWindowEnd`.
  - `daysUntilRequestedDelivery`.
  - `currentStageDurationVsBaseline` for the active stage.

- **Supplier / factory reliability**
  - `historicalOnTimeRate` for supplier/factory (last 6–12 months).
  - `avgDelayDays` for similar POs (same lane + productType).

- **Quality indicators**
  - `earlyDefectRate` from initial QA or inline checks.
  - `machineDowntimeHours` in recent period vs baseline.

- **External signals**
  - `weatherSeverityIndex` along planned route in next 72h.
  - `portCongestionIndex` at port of loading/discharge.
  - `roadDisruptionIndex` for trucking corridors.

---

### 3. Rule-Based Exceptions (MVP)

The first iteration uses transparent, rule-based alerts built on top of the event stream and baselines.

#### 3.1 Delay-Related Rules

1. **Stage running late**
   - Condition:
     - `currentStageElapsedHours > baseline * 1.2` (e.g., 20% over baseline).
   - Example:
     - Knitting baseline = 72h, current duration = 90h.
   - Severity:
     - `Warning` at 1.2×, `Critical` at 1.5×.
   - Reason code:
     - `STAGE_OVERRUN`.

2. **Port dwell time high**
   - Condition:
     - `portDwellTime > portDwellBaseline + 24h`.
   - Severity:
     - `Warning` beyond 24h over baseline; `Critical` beyond 48h.
   - Reason code:
     - `PORT_DWELL_LONG`.

3. **Low on-time probability window**
   - Condition:
     - `daysUntilShipWindowEnd < 3` **and** current stage < `Packing`.
   - Severity:
     - `Critical`.
   - Reason code:
     - `SHIP_WINDOW_AT_RISK`.

4. **In-transit delay vs schedule**
   - Condition:
     - Estimated arrival at port or destination > requested delivery date.
   - Severity:
     - `Critical`.
   - Reason code:
     - `ETA_BEYOND_REQUESTED_DATE`.

#### 3.2 Quality-Related Rules

1. **Early high defect rate**
   - Condition:
     - `earlyDefectRate > defectRateBaseline * 1.5` **and** sample size >= minimum (e.g., 30 units).
   - Severity:
     - `Warning` at 1.5×, `Critical` at 2×.
   - Reason code:
     - `EARLY_DEFECT_SPIKE`.

2. **Repeated QA failures for factory/style**
   - Condition:
     - `failedQaCountLast90Days` for (`factoryId`, `productType`) > threshold.
   - Severity:
     - `Warning`.
   - Reason code:
     - `HISTORICAL_QA_ISSUES`.

3. **Machine instability**
   - Condition:
     - `machineDowntimeHours` in recent 7 days > baseline * 1.5 for key machines producing the PO.
   - Severity:
     - `Warning`.
   - Reason code:
     - `MACHINE_INSTABILITY`.

#### 3.3 External Disruption Rules

1. **Weather alert on route**
   - Condition:
     - Severe weather alert affecting any planned port/leg within next 72h.
   - Severity:
     - `Warning` for medium alerts, `Critical` for typhoon-level signals.
   - Reason code:
     - `WEATHER_THREAT`.

2. **Port congestion index high**
   - Condition:
     - `portCongestionIndex >= 0.7` and PO scheduled to use that port within next 5 days.
   - Severity:
     - `Warning` for 0.7–0.85, `Critical` for >0.85.
   - Reason code:
     - `PORT_CONGESTION`.

3. **Road disruption on trucking leg**
   - Condition:
     - Road disruption index exceeds threshold on planned inland leg during relevant time window.
   - Severity:
     - `Warning`.
   - Reason code:
     - `ROAD_DISRUPTION`.

---

### 4. First Delay Prediction Model (ML)

Beyond rules, the first predictive model is a simple, interpretable model (e.g., gradient boosting).

#### 4.1 Target

- Binary or probabilistic target:
  - `isLateShip` = did PO miss ship window end by more than X days?
  - `isLateDelivery` (optional second target).

#### 4.2 Feature Groups

- Progress features (time remaining vs remaining work).
- Supplier/factory reliability metrics.
- Route-level baselines and current anomalies.
- External indices (weather, ports).

#### 4.3 Output

For each PO:

- `onTimeProbability` (0–1).
- `predictedDelayDays` (numeric estimate or band).
- `topContributors` – ranked list of features driving prediction.

This feeds:

- Dashboard risk score.
- Alerts when `onTimeProbability < threshold`.

---

### 5. First Quality Risk Model (ML)

#### 5.1 Target

- `isQaFailOrRework` = whether the PO experiences a QA failure or requires rework / second inspection.

#### 5.2 Features

- Supplier/factory quality history:
  - `historicalDefectRate`, `historicalReworkRate`.
- Early QA sample results:
  - `earlyDefectRate`, `defectTypes`.
- Process / IoT:
  - `temperatureDeviation`, `humidityDeviation`.
  - `machineDowntimeHours`.

#### 5.3 Output

For each PO:

- `qualityRiskProbability`.
- Categorized risk (`Low`, `Medium`, `High`).
- Key drivers for transparency.

---

### 6. Alert Payload & UI Binding

Each generated alert (rule-based or model-based) should carry:

- `alertId`.
- `tenantId`.
- `poId` and other relevant IDs (`shipmentId`, `factoryId`).
- `category`: `DELAY`, `QUALITY`, `DISRUPTION`.
- `severity`: `Info`, `Warning`, `Critical`.
- `reasonCode`: one of the codes defined above.
- `title`: short human-readable summary.
- `description`: 2–4 sentences describing cause and impact.
- `dataSources`: list of sources (`ERP`, `WorkerScans`, `IoT`, `Weather`, `PortData`).
- `recommendedActions`: list of suggested next steps.

The **Alerts screen** and **PO Story** views consume this payload to show:

- Clear explanation of **why** an order is at risk.
- The **specific signals** and data used.
- Concrete **actions** managers can take.

