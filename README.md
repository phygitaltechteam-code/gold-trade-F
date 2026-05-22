# 📋 Backend API & Database Table Reference
## Gold Trade Application — All Modules

---

## 1. 🟠 SUPER BROKER

### DB Table: `super_brokers`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / String | Primary Key (auto-generated) |
| `SBID` | String | Unique Super Broker ID (e.g. `SB-1001`), auto-generated |
| `fullname` | String | Full name |
| `phoneNumber` | String | 10-digit mobile number |
| `password` | String (hashed) | Login password |
| `aadharCardNumber` | String | 12-digit Aadhaar number |
| `aadharCardF` | String (URL) | Aadhaar card front image URL (file upload) |
| `area` | String | Geographic area/region |
| `commission` | Decimal / Float | Commission percentage (e.g. `2.5` for 2.5%) |
| `isActive` | Boolean | Account active status |
| `isVerified` | Boolean | Verification status |
| `totalBusiness` | Decimal | Computed — total business volume |
| `totalCommission` | Decimal | Computed — total commission earned |
| `pendingCommission` | Decimal | Computed — commission yet to be paid |
| `totalBrokers` | Integer | Computed — number of brokers under this super broker |
| `createdAt` | DateTime | Auto-generated |
| `updatedAt` | DateTime | Auto-generated |

### ➕ Add Super Broker — Form Fields (POST)

| Form Field Name | Input Type | Required | Notes |
|---|---|---|---|
| `fullname` | text | ✅ Yes | Full name |
| `phoneNumber` | tel | ✅ Yes | 10 digits |
| `password` | password | ✅ Yes | Min 6 chars |
| `aadharCardNumber` | text | No | 12 digits |
| `aadharCardF` | file (image) | No | JPEG/PNG, max 5MB |
| `area` | text | No | Area/Region |
| `commission` | text/number | No | Commission % |

### ✏️ Edit Super Broker Profile — Form Fields (PUT/PATCH)

| Form Field Name | Input Type | Notes |
|---|---|---|
| `fullname` | text | Editable |
| `aadharCardNumber` | text | Editable |
| `commission` | text | Editable |
| `area` | text | Editable |
| `password` | text | Editable |

---

### 📊 Super Broker List Table Columns (GET — List View)

| Column | DB Field |
|---|---|
| S.No | — (sequential) |
| SB ID | `SBID` |
| Name | `fullname` |
| Phone Number | `phoneNumber` |
| Area | `area` |
| Commission % | `commission` |
| No. of Brokers | `totalBrokers` |
| Total Business | `totalBusiness` |
| Total Commission | `totalCommission` |
| Pending Commission | `pendingCommission` |
| Status | `isActive` |

---

### 📒 Super Broker Ledger Table (Collapsed / Base View)

| Column | DB Field / Notes |
|---|---|
| Sr | — |
| Date/Time | `dateTime` |
| Transaction ID | `transactionId` |
| Script | `stript` |
| Transaction Amount | `transactionAmount` |
| Super Broker Commission | `superBrokerCommission` |
| Status | `status` |

### 📒 Super Broker Ledger Table (Expanded / View More)

| Column | DB Field / Notes |
|---|---|
| Sr | — |
| Date/Time | `dateTime` |
| Customer Name | `customerName` |
| Broker Name | `brokerName` |
| Transaction ID | `transactionId` |
| Script | `stript` |
| Order Type | `orderType` |
| Holding Type | `holdingType` |
| Qty | `qty` |
| Price | `price` |
| Status | `status` |
| Transaction Amount | `transactionAmount` |
| Total Amount | `totalAmount` |
| Paid Amount | `paidAmount` |
| Margin Amount | `marginAmount` |
| Total Commission | `totalCommission` |
| Broker Commission | `brokerCommission` |
| Super Broker Commission | `superBrokerCommission` |
| Payment Status | `paymentStatus` |

### 💳 Super Broker Payment History Table

| Column | DB Field / Notes |
|---|---|
| Sr | — |
| Date | `date` |
| Commission Generated | `commissionGenerated` |
| Paid Amount | `paidAmount` |
| Paid Date | `paidDate` |
| Status | `status` |

---
---

## 2. 🔵 BROKER

### DB Table: `brokers`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / String | Primary Key |
| `BKId` | String | Unique Broker ID (e.g. `BK-1001`), auto-generated |
| `fullname` | String | Full name |
| `phoneNumber` | String | 10-digit mobile number |
| `password` | String (hashed) | Login password |
| `aadharCardNumber` | String | 12-digit Aadhaar number |
| `aadharCardF` | String (URL) | Aadhaar card front image URL |
| `area` | String | Geographic area/region |
| `commission` | Decimal / Float | Commission percentage |
| `superBrokerId` | UUID / String (FK) | Foreign Key → `super_brokers.id` |
| `isActive` | Boolean | Account active status |
| `isVerified` | Boolean | Verification status |
| `totalBusiness` | Decimal | Computed |
| `totalCommission` | Decimal | Computed |
| `pendingCommission` | Decimal | Computed |
| `totalCustomers` | Integer | Computed |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

### ➕ Add Broker — Form Fields (POST)

| Form Field Name | Input Type | Required | Notes |
|---|---|---|---|
| `fullname` | text | ✅ Yes | Full name |
| `phoneNumber` | tel | ✅ Yes | 10 digits |
| `password` | password | ✅ Yes | Min 6 chars |
| `superBrokerId` | select / search | ✅ Yes | Assign to a Super Broker |
| `aadharCardNumber` | text | No | 12 digits |
| `aadharCardF` | file (image) | No | JPEG/PNG max 5MB |
| `area` | text | No | Area/Region |
| `commission` | text/number | No | Commission % |

### ✏️ Edit Broker Profile — Form Fields (PUT/PATCH)

| Form Field Name | Input Type | Notes |
|---|---|---|
| `fullname` | text | Editable |
| `aadharCardNumber` | text | Editable |
| `commission` | text | Editable |
| `area` | text | Editable |
| `password` | text | Editable |

---

### 📊 Broker List Table Columns (GET — List View)

| Column | DB Field |
|---|---|
| Broker Details (Name) | `fullname` |
| ID | `BKId` |
| Contact & Area | `phoneNumber`, `area` |
| Stats | `totalCustomers`, `totalBusiness` |
| Commission | `totalCommission`, `commission` |
| Status | `isActive` |

---

### 📒 Broker Ledger Table (Collapsed)

| Column | DB Field |
|---|---|
| Sr | — |
| Date/Time | `dateTime` |
| Transaction ID | `transactionId` |
| Script | `stript` |
| Transaction Amount | `transactionAmount` |
| Status | `status` |

### 📒 Broker Ledger Table (Expanded — View More)

| Column | DB Field |
|---|---|
| Sr | — |
| Date/Time | `dateTime` |
| Customer Name | `customerName` |
| Broker Name | `brokerName` |
| Transaction ID | `transactionId` |
| Script | `stript` |
| Order Type | `orderType` |
| Holding Type | `holdingType` |
| Qty | `qty` |
| Price | `price` |
| Status | `status` |
| Transaction Amount | `transactionAmount` |
| Total Amount | `totalAmount` |
| Paid Amount | `paidAmount` |
| Margin Amount | `marginAmount` |
| Total Commission | `totalCommission` |
| Broker Commission | `brokerCommission` |
| Payment Status | `paymentStatus` |

### 💳 Broker Payment History Table

| Column | DB Field |
|---|---|
| Sr | — |
| Date | `date` |
| Commission Generated | `commissionGenerated` |
| Paid Amount | `paidAmount` |
| Paid Date | `paidDate` |
| Status | `status` |

---
---

## 3. 🟢 CLIENT

### DB Table: `clients` (customer/profile data)

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / String | Primary Key |
| `accountNumber` | String | Unique account number |
| `brokerId` | UUID / String (FK) | Foreign Key → `brokers.id` |
| `address` | String | Street address |
| `city` | String | City |
| `state` | String | State/Province |
| `country` | String | Country code |
| `pincode` | String | Postal/ZIP code |
| `photo` | String (URL) | Profile photo URL |
| `passport` | String (URL) | Passport document URL |
| `passportNumber` | String | Passport number |
| `aadharCard` | String (URL) | Aadhaar card document URL |
| `aadharCardNumber` | String | Aadhaar number |
| `panCard` | String (URL) | PAN card document URL |
| `panCardNumber` | String | PAN number |
| `rejectedReason` | String | Reason for rejection (if any) |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

### DB Table: `users` (linked to clients)

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / String | Primary Key |
| `fullname` | String | Full legal name |
| `email` | String | Email address |
| `phoneNumber` | String | Contact phone |
| `password` | String (hashed) | Login password |
| `securityPin` | String (hashed) | 6-digit security PIN |
| `dob` | Date | Date of birth |
| `isActive` | Boolean | Active status |
| `isVerified` | Boolean | KYC verified |
| `isRejected` | Boolean | Rejected status |

### DB Table: `wallets`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary Key |
| `clientId` | UUID (FK) | Foreign Key → `clients.id` |
| `eprivateAccount` | Decimal | Private/main balance |
| `temporyAccount` | Decimal | Temporary balance |

---

### ➕ Add Client — Step 1: Personal Info Form Fields (POST)

| Form Field Name | Input Type | Required | Notes |
|---|---|---|---|
| `accountHolderName` | text | ✅ Yes | Full legal name |
| `dateOfBirth` | date | ✅ Yes | Must be 18+ |
| `contactEmail` | email | ✅ Yes | Valid email |
| `password` | password | ✅ Yes | Min 8 chars, mixed case + special char |
| `securityPin` | text (numeric) | ✅ Yes | Exactly 6 digits |
| `contactPhone` | tel | ✅ Yes | 10 digits |
| `streetAddress` | textarea | ✅ Yes | Street / Apartment / Unit |
| `postalCode` | text | Yes | 6 digits (India) / 5 digits (US) |
| `city` | text | ✅ Yes | Auto-filled via pincode if India/US |
| `stateProvince` | text | ✅ Yes | Auto-filled via pincode |
| `country` | select | ✅ Yes | Country dropdown |

### ➕ Add Client — Step 2: KYC Document Upload Fields

| Form Field Name | Input Type | Notes |
|---|---|---|
| `photo` | file (image) | Profile photo |
| `aadharCard` | file (image) | Aadhaar card image |
| `panCard` | file (image) | PAN card image |
| `passport` | file (image) | Passport image |

---

### 📊 Client List Table Columns (GET — List View)

| Column | DB Field |
|---|---|
| Account Details (Name + Account No.) | `user.fullname`, `accountNumber` |
| Mobile Number | `user.phoneNumber` |
| Email | `user.email` |
| City / State | `city`, `state` |
| Transactions | `_count.senderTransactions` |
| Private Balance | `wallets[0].eprivateAccount` |
| Temp Balance | `wallets[0].temporyAccount` |
| Status | `user.isVerified`, `user.isActive` |

---
---

## 4. 📖 TRANSACTION LEDGER

### DB Table: `transactions`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary Key |
| `transactionId` | String | Unique transaction ID |
| `dateTime` | DateTime | Transaction date and time |
| `admin` | String / FK | Admin who processed |
| `customerName` | String | Client name (denormalized or FK) |
| `customerId` | UUID (FK) | Foreign Key → `clients.id` |
| `brokerName` | String | Broker name |
| `brokerId` | UUID (FK) | Foreign Key → `brokers.id` |
| `stript` | String | Script/Instrument (e.g. Gold Spot) |
| `orderType` | String | BUY / SELL |
| `holdingType` | String | Holding type (e.g. Bullion) |
| `qty` | Decimal | Quantity |
| `price` | Decimal | Price per unit |
| `transactionAmount` | Decimal | Transaction amount |
| `totalAmount` | Decimal | Total amount |
| `paidAmount` | Decimal | Amount paid |
| `marginAmount` | Decimal | Margin amount |
| `brokerCommission` | Decimal | Broker's commission |
| `superBrokerCommission` | Decimal | Super Broker's commission |
| `totalCommission` | Decimal | Total commission |
| `status` | String | Order status |
| `paymentStatus` | String | Payment status |

### 📊 Transaction Ledger Table — Collapsed (Base) View

| Column | DB Field |
|---|---|
| Sr | — |
| Date/Time | `dateTime` |
| Admin | `admin` |
| Transaction ID | `transactionId` |
| Script | `stript` |
| Transaction Amount | `transactionAmount` |
| Status | `status` |

### 📊 Transaction Ledger Table — Expanded (View More) View

| Column | DB Field |
|---|---|
| Sr | — |
| Date/Time | `dateTime` |
| Admin | `admin` |
| Customer Name | `customerName` |
| Broker Name | `brokerName` |
| Transaction ID | `transactionId` |
| Script | `stript` |
| Order Type | `orderType` |
| Holding Type | `holdingType` |
| Qty | `qty` |
| Price | `price` |
| Status | `status` |
| Transaction Amount | `transactionAmount` |
| Paid Amount | `paidAmount` |
| Margin Amount | `marginAmount` |
| Broker Commission | `brokerCommission` |
| Super Broker Commission | `superBrokerCommission` |
| Payment Status | `paymentStatus` |

> **Filter Params:** `startDate`, `endDate` (date range filters via query params)

---
---

## 5. ⏳ PENDING APPROVALS

> This page shows **two tabs**: Broker Pending Requests & Customer Pending Requests.

### 📊 Broker Pending Table Columns

| Column | DB Field |
|---|---|
| Sr | — |
| Name + Broker ID | `fullname`, `BKId` |
| Phone Number | `phoneNumber` |
| Super Broker | `superBroker.fullname` / `superBrokerId` |
| Aadhar Card Number | `aadharCardNumber` |
| Area | `area` |
| Commission % | `commission` |
| Action | Approve / Edit / Delete buttons |

### ✏️ Edit Broker Modal Form Fields (PUT/PATCH)

| Form Field Name | Input Type | Required |
|---|---|---|
| `fullname` | text | ✅ Yes |
| `phoneNumber` | text | ✅ Yes |
| `aadharCardNumber` | text | No |
| `area` | text | No |
| `commission` | number | No |

---

### 📊 Client Pending Table Columns

| Column | DB Field |
|---|---|
| Sr | — |
| Name + Email | `user.fullname`, `user.email` |
| Phone Number | `user.phoneNumber` |
| Super Broker | `broker.superBroker.fullname` |
| Broker | `broker.fullname` / `brokerId` |
| Aadhar Card Number | `aadharCard` |
| Action | Approve / Edit / Delete buttons |

### ✏️ Edit Client Modal Form Fields (PUT/PATCH)

| Form Field Name | Input Type | Required |
|---|---|---|
| `fullname` | text | ✅ Yes |
| `phoneNumber` | text | ✅ Yes |
| `aadharCard` | text | No |
| `brokerId` | select | No | Assign/Reassign Broker |

---

### 🔘 Filter / Dropdown Options on Pending Approvals

| Filter Name | Options |
|---|---|
| Status Toggle | `PENDING` / `ALL` |
| Super Broker Filter (Broker Tab) | List of all Super Brokers |
| Broker Filter (Broker Tab) | List of all Brokers |
| Broker Filter (Client Tab) | List of all Brokers |
| Search (Broker Tab) | By name or phone |
| Search (Client Tab) | By name or phone |

---
---

## 6. 📡 LIVE MONITORING (Live Order Book)

### DB Table: `orders` / `live_orders`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary Key |
| `orderId` | String | Unique Order ID (e.g. `#8821`) |
| `time` | DateTime | Order time |
| `client` | String / FK | Client name or FK |
| `clientId` | UUID (FK) | Foreign Key → `clients.id` |
| `sript` | String | Script/Instrument (e.g. Gold Spot) |
| `holdingType` | String | Holding type (e.g. Bullion) |
| `type` | Enum | `BUY` or `SELL` |
| `qty` | Decimal | Quantity (in OZ) |
| `price` | Decimal | Price per unit |
| `totalAmount` | Decimal | Total amount |
| `paidAmount` | Decimal | Paid amount |
| `marginAmount` | Decimal | Margin amount |
| `status` | Enum | `Pending`, `Flagged`, `Executed`, `Partial` |

### 📊 Live Monitoring Table Columns

| Column | DB Field |
|---|---|
| Sr | — |
| Date/Time | `time` |
| Order ID | `orderId` |
| Client Name | `client` |
| Script | `sript` |
| Type | `type` (BUY/SELL) |
| Qty (OZ) | `qty` |
| Holding Type | `holdingType` |
| Price | `price` |
| Total Amount | `totalAmount` |
| Paid Amount | `paidAmount` |
| Margin Amount | `marginAmount` |
| Status | `status` |

### 🔘 Filters on Live Monitoring

| Filter | Options |
|---|---|
| Instrument | `All`, `Spot`, `Futures` |
| Search | By Order ID, Client Name, Script |

---
---

## 7. 💸 WITHDRAWAL REQUEST

### DB Table: `withdrawal_requests`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary Key |
| `requestId` | String | Unique Request ID (e.g. `#W-94821`) |
| `date` | Date | Request date |
| `time` | Time / DateTime | Request time |
| `clientId` | UUID (FK) | Foreign Key → `clients.id` |
| `clientName` | String | Client name |
| `clientTier` | String | Client tier (Gold, Silver, etc.) |
| `brokerName` | String / FK | Broker name |
| `brokerId` | UUID (FK) | Foreign Key → `brokers.id` |
| `superBrokerName` | String / FK | Super Broker name |
| `superBrokerId` | UUID (FK) | Foreign Key → `super_brokers.id` |
| `walletBalance` | Decimal | Client's current wallet balance |
| `amount` | Decimal | Withdrawal amount |
| `withdrawType` | String | `Bank Transfer`, `Wire Transfer`, `Crypto Wallet`, `PayPal` |
| `detailAmount` | Decimal | Net amount after fee (amount - fee) |
| `paidDate` | Date / String | Date when paid |
| `fee` | Decimal | Transaction fee |
| `bank` | String | Bank name |
| `accountLast4` | String | Last 4 digits of bank account |
| `status` | Enum | `Pending`, `Review`, `On Hold`, `Approved`, `Rejected` |
| `isHighValue` | Boolean | Flag for high-value withdrawals |

### 📊 Withdrawal Request Table Columns (Desktop View)

| Column | DB Field |
|---|---|
| Sr | — |
| Request ID | `requestId` |
| Client Name | `client.name` |
| Broker Name | `brokerName` |
| Super Broker Name | `superBrokerName` |
| Wallet Balance | `walletBalance` |
| Withdraw Amount | `amount` |
| Withdraw Type | `withdrawType` |
| Detail Amount | `detailAmount` |
| Paid Date | `paidDate` |
| Status | `status` |
| Actions | Approve / Reject buttons |

### 🔘 Withdrawal Request Tabs / Filters

| Tab / Filter | Values |
|---|---|
| Status Tabs | `Pending`, `Approved`, `Rejected` |
| Search | By Request ID, Client Name, Amount, Bank |
| Summary Stats | Pending Count, Pending Amount, Processed Today, Total Outflow |

---
---

## 📌 Summary: All DB Tables

| Module | DB Table(s) |
|---|---|
| Super Broker | `super_brokers` |
| Broker | `brokers` |
| Client | `clients`, `users`, `wallets` |
| Transaction Ledger | `transactions` |
| Pending Approvals | Uses `brokers` + `clients` |
| Live Monitoring | `orders` / `live_orders` |
| Withdrawal Request | `withdrawal_requests` |

---

## 📌 Common Computed/Aggregated Fields (via SQL or app logic)

| Field | Computed From |
|---|---|
| `totalBusiness` | Sum of all transaction amounts |
| `totalCommission` | Sum of all commissions |
| `pendingCommission` | Total commission - paid commission |
| `totalBrokers` | COUNT of brokers under a super broker |
| `totalCustomers` | COUNT of clients under a broker |
| `totalTrans` | COUNT of transactions by a client |
