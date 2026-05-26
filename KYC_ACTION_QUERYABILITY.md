# KYC Action 可查询性核查表

用于管理 AIX KYC 全流程 action、前端动作、后端动作、可查询性、数据来源、查询实例、查询表与 SQL 口径。

## 可查询性枚举

| 标记 | 含义 |
|---|---|
| ✅ 可直接查 | 当前账号有权限的业务表可以明确查询 |
| ❌ 不能直接查 | 无确定 SQL 来源，或当前账号没有该明细数据权限；不计入严格 action 漏斗 |
| 前端埋点仅代码可证 | AIX 前端代码可确认 PageEvent / sendEvent 发送到 Native Bridge，但当前无确定 SQL 表名/字段；不作为可直接查节点 |

## SQL 参数说明

- 所有统计 SQL 固定从 `2026-03-01 00:00:00` 开始查询，到当前最新数据；不再要求输入 `user_id`。
- 查询 SQL 优先写完整 `database.table`，避免 SQL 工具右侧选错 database/schema 时解析到错误库。
- `查询实例` 和 `查询表` 仍保留完整来源，用于确认应选择哪个实例与哪个 database/schema。
- 日志明细类节点曾以 `logs.service_log_sg_prod` 作为候选来源，但该表当前账号无可用权限，因此已从正式查询来源中移除，不再提供 SQL。
- `dba_logs` 当前数据字典只有聚合 count 表，不能用于用户级 KYC 明细链路；因此不作为 KYC action 查询表。

## 重要口径说明

- `/aix/kyc/success` / `OpenWalletSubmitResult` 不是最终 KYC 通过，只能视为「提交结果页 / 已进入审核」。
- 最终 KYC 通过必须以 `aixpay_wallet.wallet_application.kyc_status = 5` 为准。
- POA 是条件分支，不能默认放进所有用户的主漏斗。
- `wallet_application.nationality` 不是进入 KYC Start Page 时写入；只有 Start Page Continue 提交成功后才写入。
- 前端行为类 action 当前未找到确定 SQL 落表；不作为可直接查节点。
- 后端接口日志类 action 当前账号没有可用的日志明细权限表；不作为可直接查节点。
- 「前端动作」描述用户在页面上看到/点击/提交的动作；「后端动作」描述系统接口、落库、状态更新。两列均按 AIX 代码事实填写。

## KYC Action 可查询性核查表

| 顺序 | Action Code | Action 含义 | 前端动作 | 后端动作 | 能否查 | 清晰数据来源 / 查询条件 | 查询实例 | 查询表 | 查询 SQL |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | `kyc_launch_enter` | 进入 KYC Launch loading | 用户从业务入口进入 KYC 流程，先看到一个 KYC loading / 路由中转页。 | 无业务处理；只是前端进入 loading 页。 | ❌ 不能直接查 | 暂无确定 SQL 来源。业务库不落表；`PageNameMap` 未映射 KycLaunch。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无确定 SQL 来源。` |
| 2 | `kyc_start_api_called` | 调用 KYC start 接口 | KYC loading 页加载后，App 自动向后端请求“这个用户下一步该去哪”。 | 后端检查用户当前 KYC / 钱包申请状态，并返回下一步路由。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；不列入正式 SQL 来源。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；请申请 KYC 后端明细日志权限。` |
| 3 | `kyc_start_route_decided` | 后端返回下一步 route code | App 根据后端返回结果，把用户带到对应页面，例如 Start 页、证件页、POA 页、结果页等。 | 后端返回下一步 route code，例如 `ROUTE_KYC_START_PAGE / ROUTE_PASSPORT_PAGE / ROUTE_POA_PAGE`。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；不列入正式 SQL 来源。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；请申请 KYC 后端明细日志权限。` |
| 4 | `kyc_start_page_view` | 进入 KYC Start Page | 用户看到 KYC Start Page，页面包含居住国家选择、准备材料说明、协议勾选和 Continue 按钮。 | 无业务处理；页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。前端 PageEvent 发送到 Native Bridge，但当前没有确认事件表名/字段；业务库不记录页面曝光。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无页面曝光 SQL 来源。` |
| 5 | `kyc_country_select_open` | 点击国家输入框进入国家列表 | 用户在 KYC Start Page 点击“居住国家”输入框，进入国家选择列表页。 | 无业务处理；只是前端打开国家选择页。 | ❌ 不能直接查 | 无确定 SQL 来源。代码未看到独立 click 埋点或业务落库。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无点击 SQL 来源。` |
| 6 | `kyc_region_list_loaded` | 国家列表加载成功 | 用户进入国家选择列表页后，App 加载可选国家列表。 | 后端返回 KYC Start Page 可选国家列表。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；不列入正式 SQL 来源。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；请申请 KYC 后端明细日志权限。` |
| 7 | `kyc_region_click` | 点击选择国家 | 用户在国家列表中点击某个国家。 | 无业务处理；选择结果只先回填到前端页面，不立即落库。 | ❌ 不能直接查 | 无确定 SQL 来源。当前无事件表名/字段；业务库不记录点击。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无国家点击 SQL 来源；可看第 15 行 nationality 写入结果。` |
| 8 | `kyc_region_selected_back_to_start` | 国家回填 Start 页 | 用户选完国家后返回 KYC Start Page，国家输入框显示已选择的国家。 | 无业务处理；纯前端状态回填。 | ❌ 不能直接查 | 只是 `DeviceEventEmitter` 前端状态回传，无独立业务落库。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：纯前端状态回填。` |
| 9 | `kyc_agreement_checkbox_click` | 点选协议 checkbox | 用户勾选 KYC 协议 checkbox。 | 无业务处理；勾选本身不调用后端。 | ❌ 不能直接查 | Contract 组件有 checkbox UI，但未看到独立 `sendEvent` 或业务落库。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：checkbox 勾选无确定 SQL 来源；可看第 13 行协议落库结果。` |
| 10 | `kyc_agreement_all_selected` | 协议全部勾选完成 | 用户完成协议勾选，Continue 按钮满足可点击条件之一。 | 无业务处理；只是前端状态。 | ❌ 不能直接查 | 只是前端 `isAgreed` 状态，无业务落库。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：纯前端状态。` |
| 11 | `kyc_start_continue_click` | Start 页点击 Continue | 用户在 KYC Start Page 选好国家并勾选协议后，点击 Continue。 | 点击本身不单独落库；随后 App 会提交国家和协议确认。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录按钮点击；后续 `/start-page/submit` 只能说明提交成功。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无按钮点击 SQL 来源；可看第 13/15 行业务表结果。` |
| 12 | `kyc_start_page_submit_api` | 提交国家 + 协议确认 | 用户点击 Continue 后，App 提交用户选择的居住国家。 | 后端校验国家是否支持，并处理 KYC Start 页提交。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；可用第 13/15 行业务表结果间接验证。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可用第 13/15 行业务表结果间接验证。` |
| 13 | `kyc_agreement_saved` | KYC_START 协议落库 | 无单独页面动作；这是用户点击 Continue 后的后端结果。 | 后端保存 `KYC_START` 协议同意记录。 | ✅ 可直接查 | `aixpay_app.user_agreement_consent`：`location = 'KYC_START'`，时间字段 `consented_at`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_app.user_agreement_consent | `SELECT COUNT(*) AS consent_records, COUNT(DISTINCT user_id) AS consent_users FROM aixpay_app.user_agreement_consent WHERE location = 'KYC_START' AND consented_at >= '2026-03-01 00:00:00';` |
| 14 | `wallet_application_created_or_loaded` | 创建或获取 KYC 主申请 | 无单独页面动作；属于进入/提交 KYC 后的系统处理。 | 后端获取已有 KYC 钱包申请；如果没有则创建新的 `wallet_application`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：按 `user_id` 查记录；时间字段 `create_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE create_time >= '2026-03-01 00:00:00';` |
| 15 | `kyc_country_saved_to_wallet_application` | 国家写入 KYC 申请 | 用户在 Start 页提交的居住国家被系统保存。 | 后端把国家写入 `wallet_application.nationality`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：Start 页 submit 后写入 `nationality`；不能用该字段判断是否仅进入 Start Page。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count, COUNT(DISTINCT nationality) AS nationality_count FROM aixpay_wallet.wallet_application WHERE nationality IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 16 | `route_to_passport_guide` | 后端返回 Passport Guide 路由 | Start 页提交成功后，App 准备跳转到证件拍摄引导页。 | 后端返回下一步为 Passport Guide。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；不列入正式 SQL 来源。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可用第 20 行 passport_request_id 作为进入 passport 后端成功结果。` |
| 17 | `passport_guide_page_view` | 进入证件引导页 | 用户看到证件拍摄引导页，需要准备护照并点击相机按钮开始验证。 | 无业务处理；页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录页面曝光。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无页面曝光 SQL 来源；可看第 20 行 passport_request_id_saved。` |
| 18 | `passport_start_verify_click` | 点击开始证件验证 | 用户在证件引导页点击相机 / 开始验证按钮。 | 点击本身不落库；授权相机通过后，App 请求 passport 验证 URL。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录点击。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无按钮点击 SQL 来源；可看第 20 行 passport_request_id_saved。` |
| 19 | `passport_get_url_api` | 请求 passport AAI URL | 用户点击证件验证并完成相机权限流程后，App 请求第三方证件验证页面 URL。 | 后端向上游申请 passport 验证 URL，并返回给前端。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；可用第 20 行 `passport_request_id` 写入作为成功结果。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可用第 20 行 passport_request_id 写入作为成功结果。` |
| 20 | `passport_request_id_saved` | 写入 passport_request_id | 无单独页面动作；这是请求 passport URL 成功后的系统结果。 | 后端保存 passport request_id，并把主申请状态置为处理中。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`passport_request_id IS NOT NULL`；同时 `passport_status` 初始化、`kyc_status = 1/PROCESSING`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE passport_request_id IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 21 | `passport_scan_page_view` | 进入 passport WebView 扫描页 | App 打开第三方 passport WebView，用户在 WebView 中拍摄/提交证件。 | 无业务处理；打开 WebView 本身不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录 WebView 页面曝光。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 WebView 页面曝光 SQL 来源；可看第 20 行 passport_request_id_saved。` |
| 22 | `passport_verify_result_success` | Passport WebView 成功 | 第三方 passport WebView 返回 success，App 跳转到 Face Guide。 | 无直接后端接口；上游回调/后端状态同步是另一条链路。 | ❌ 不能直接查 | 无确定 WebView 回调事件 SQL 来源。业务表 passport 成功不等同于前端 WebView 回调成功。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 WebView 回调 SQL 来源；可用 wallet_application.passport_status=3 查询后端 passport 成功结果。` |
| 23 | `passport_verify_result_failed` | Passport WebView 失败 | 第三方 passport WebView 返回 failed，App 回到证件引导页让用户重试。 | 无直接后端接口；上游回调/后端状态同步是另一条链路。 | ❌ 不能直接查 | 无确定 WebView 回调事件 SQL 来源。业务表 passport 失败不等同于前端 WebView 回调失败。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 WebView 回调 SQL 来源；可用 wallet_application.passport_status=2 查询后端 passport 失败结果。` |
| 24 | `face_guide_page_view` | 进入 Face Guide | Passport WebView 前端成功后，用户看到人脸活体引导页。 | 无业务处理；页面曝光不触发后端接口。 | ❌ 不能直接查 | 页面存在，但业务库不记录页面曝光。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 Face Guide 页面曝光 SQL 来源；可看第 27 行 liveness_request_id_saved。` |
| 25 | `face_continue_click` | Face Guide 点击 Continue | 用户在人脸活体引导页点击 Continue，并进入相机权限流程。 | 点击本身不落库；权限通过后，App 请求 liveness 验证 URL。 | ❌ 不能直接查 | 代码有点击逻辑，但未看到 `sendEvent`；业务库不记录点击。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无按钮点击 SQL 来源；可看第 27 行 liveness_request_id_saved。` |
| 26 | `liveness_get_url_api` | 请求 liveness AAI URL | 用户在人脸活体引导页点击 Continue 且权限通过后，App 请求第三方活体验证 URL。 | 后端向上游申请 liveness 验证 URL，并返回给前端。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；可用第 27 行 `liveness_request_id` 写入作为成功结果。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可用第 27 行 liveness_request_id 写入作为成功结果。` |
| 27 | `liveness_request_id_saved` | 写入 liveness_request_id | 无单独页面动作；这是请求 liveness URL 成功后的系统结果。 | 后端保存 liveness request_id，并把主申请状态置为处理中。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`liveness_request_id IS NOT NULL`；同时 `liveness_status` 初始化、`kyc_status = 1/PROCESSING`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE liveness_request_id IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 28 | `face_scan_page_view` | 进入 Face Scan WebView | App 打开第三方活体 WebView，用户在 WebView 中完成活体检测。 | 无业务处理；打开 WebView 本身不触发后端接口。 | ❌ 不能直接查 | 页面存在，但业务库不记录 WebView 页面曝光。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 Face Scan WebView 页面曝光 SQL 来源；可看第 27 行 liveness_request_id_saved。` |
| 29 | `face_scan_finished` | Face WebView 完成，成功/失败都进轮询 | 第三方活体 WebView 返回 success 或 failed，App 都进入结果轮询页。 | 无直接后端接口；下一步轮询接口是独立动作。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录 Face WebView 完成事件。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 Face WebView 完成事件 SQL 来源；可看第 31/32 行业务状态。` |
| 30 | `passport_face_result_polling` | 轮询 passport + face 结果 | App 进入结果轮询页，持续查询证件和活体结果。 | 后端检查 passport 和 liveness 的最新状态，并返回 processing、失败或下一步路由。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；可用第 31/32 行业务状态查询处理/失败结果。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可用第 31/32 行业务状态查询处理/失败结果。` |
| 31 | `passport_or_liveness_processing` | 证件/活体处理中 | 轮询页显示处理中，并继续轮询。 | 后端判断 passport 或 liveness 仍在处理中，返回 `PROCESSING`。 | ✅ 可直接查 | 业务表可查 `passport_status=1` 或 `liveness_status=1`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE (passport_status = 1 OR liveness_status = 1) AND update_time >= '2026-03-01 00:00:00';` |
| 32 | `passport_or_liveness_failed` | 证件/活体失败 | 轮询页进入失败状态，展示失败原因和下一步引导。 | 后端判断 passport 或 liveness 失败，返回 `KYC_FAILED`。 | ✅ 可直接查 | `wallet_application.passport_status=2` 或 `liveness_status=2`；如需要子项明细可另查 `kyc_info_record`，但主表 SQL 先保留在 `wallet_application`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE (passport_status = 2 OR liveness_status = 2) AND update_time >= '2026-03-01 00:00:00';` |
| 33 | `route_to_poa_page` | 后端返回 POA 页面路由 | 证件和活体通过后，如果需要地址证明，App 跳转 POA 页面。 | 后端返回下一步为 POA 页面，并返回国家信息。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；不列入正式 SQL 来源。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可看第 40/43 行 POA 业务结果。` |
| 34 | `poa_page_view` | 进入 POA 页面 | 用户看到地址证明上传页，需要选择居住国家并上传地址证明文件。 | 无业务处理；页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录页面曝光。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 POA 页面曝光 SQL 来源；可看第 40/43 行 POA 业务结果。` |
| 35 | `poa_country_select_open` | POA 页打开国家选择 | 用户在 POA 页面点击“居住国家”输入框，进入国家选择列表页。 | 无业务处理；打开国家选择页不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。POA confirm 请求中的 countryCode 只能说明提交时国家值，但当前账号也无可查询日志权限。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 POA 国家选择打开事件 SQL 来源。` |
| 36 | `poa_upload_click` | 点击 POA Upload | 用户在 POA 页面点击 Upload，打开上传方式选择弹窗。 | 无业务处理；点击 Upload 本身不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。后端 `/poa/upload` 只能说明文件上传发生，但当前账号无可查询日志权限。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 Upload 点击 SQL 来源；可看第 40 行 poa_request_id 写入结果。` |
| 37 | `poa_select_upload_type` | 选择上传类型 files/album | 用户在上传方式弹窗中选择从文件或相册上传。 | 无业务处理；选择上传类型本身不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。后端上传接口也不能稳定表达用户选择的是 files 还是 album。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无上传类型选择 SQL 来源。` |
| 38 | `poa_take_photo_click` | 点击拍照上传 | 用户点击 POA 页面相机按钮，进入拍照/相机权限流程。 | 无业务处理；拍照点击本身不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。后端上传接口只能说明 POA 文件上传，不区分拍照点击，且当前账号无可查询日志权限。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无拍照点击 SQL 来源；可看第 40 行 poa_request_id 写入结果。` |
| 39 | `poa_file_upload_api` | POA 文件上传 | 用户选择文件、相册图片或拍照完成后，App 开始上传地址证明文件。 | 后端接收 POA 文件并上传保存。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；可用第 40 行 `poa_request_id` 写入作为上传成功结果。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可用第 40 行 poa_request_id 写入作为上传成功结果。` |
| 40 | `poa_upload_success_frontend` | 前端上传成功，拿到 fileId/fileUrl | POA 文件上传成功后，页面展示文件卡片，Continue 按钮可提交。 | 后端返回 fileId/fileUrl；同时创建 POA 记录、保存 OSS 文件，并更新主申请 POA request_id / 状态。 | ✅ 可直接查 | 业务表可看 `wallet_application.poa_request_id IS NOT NULL` 或 POA 状态字段。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE poa_request_id IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 41 | `poa_submit_click` | 点击 POA Continue/Submit | 用户上传文件并选择国家后，点击 POA 页 Continue 提交。 | 点击本身不落库；随后 App 会调用 POA confirm。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录按钮点击；后端 confirm 日志当前账号也无可查询日志权限。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无 POA Submit 点击 SQL 来源；可看第 43 行 kyc_status=2。` |
| 42 | `poa_confirm_api` | POA confirm 提交 | 用户点击 POA Continue 后，App 提交 fileId 和 countryCode。 | 后端确认 POA 上传，提交地址证明信息。 | ❌ 当前账号不能直接查 | 候选来源为 Doris 后端明细日志，但当前账号无可查询明细日志表权限；可用第 43 行 `kyc_status = 2` 作为提交后进入审核结果。 | 无当前可用权限表 | 无当前可用权限表 | `-- 当前账号无可用权限表，不提供正式 SQL；可用第 43 行 kyc_status=2 作为提交后进入审核结果。` |
| 43 | `kyc_application_under_review` | KYC 完整提交，进入审核 | POA confirm 成功后，App 跳转 KYC 提交结果页。 | 后端把 KYC 主申请状态更新为 `UNDER_REVIEW`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 2`；时间字段优先 `update_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 2 AND update_time >= '2026-03-01 00:00:00';` |
| 44 | `kyc_submit_result_page_view` | 进入提交结果页 | 用户看到 KYC 提交结果页，表示材料已提交/进入审核，不代表最终通过。 | 无业务处理；页面曝光不触发后端接口。 | ❌ 不能直接查 | 无确定 SQL 来源。业务库不记录页面曝光；`kyc_status = 2` 只能说明进入审核。 | 无确定 SQL 来源 | 无确定 SQL 来源 | `-- 不可直接查：无提交结果页曝光 SQL 来源；可看第 43 行 kyc_status=2。` |
| 45 | `kyc_final_approved` | 最终 KYC 通过 | 无直接前端动作；用户状态由后端审核结果决定。 | 后端获取 DTC 审核结果后，把 `wallet_application.kyc_status` 更新为成功。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 5`；时间字段 `finished_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 5 AND COALESCE(finished_time, update_time) >= '2026-03-01 00:00:00';` |
| 46 | `kyc_final_failed` | 最终 KYC 失败 | 无直接前端动作；用户状态由后端审核结果或异常处理决定。 | 后端获取 DTC 审核结果或处理异常后，把 `wallet_application.kyc_status` 更新为失败。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 3`；时间字段 `finished_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 3 AND COALESCE(finished_time, update_time) >= '2026-03-01 00:00:00';` |
| 47 | `kyc_final_rejected` | 最终 KYC 拒绝 | 无直接前端动作；用户状态由后端审核结果决定。 | 后端获取 DTC 审核结果后，把 `wallet_application.kyc_status` 更新为拒绝。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 4`；时间字段 `finished_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 4 AND COALESCE(finished_time, update_time) >= '2026-03-01 00:00:00';` |

## ✅ 可直接查的行

| 顺序 | Action Code | Action 含义 | 前端动作 | 后端动作 | 能否查 | 清晰数据来源 / 查询条件 | 查询实例 | 查询表 | 查询 SQL |
|---:|---|---|---|---|---|---|---|---|---|
| 13 | `kyc_agreement_saved` | KYC_START 协议落库 | 无单独页面动作；这是用户点击 Continue 后的后端结果。 | 后端保存 `KYC_START` 协议同意记录。 | ✅ 可直接查 | `aixpay_app.user_agreement_consent`：`location = 'KYC_START'`，时间字段 `consented_at`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_app.user_agreement_consent | `SELECT COUNT(*) AS consent_records, COUNT(DISTINCT user_id) AS consent_users FROM aixpay_app.user_agreement_consent WHERE location = 'KYC_START' AND consented_at >= '2026-03-01 00:00:00';` |
| 14 | `wallet_application_created_or_loaded` | 创建或获取 KYC 主申请 | 无单独页面动作；属于进入/提交 KYC 后的系统处理。 | 后端获取已有 KYC 钱包申请；如果没有则创建新的 `wallet_application`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：按 `user_id` 查记录；时间字段 `create_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE create_time >= '2026-03-01 00:00:00';` |
| 15 | `kyc_country_saved_to_wallet_application` | 国家写入 KYC 申请 | 用户在 Start 页提交的居住国家被系统保存。 | 后端把国家写入 `wallet_application.nationality`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：Start 页 submit 后写入 `nationality`；不能用该字段判断是否仅进入 Start Page。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count, COUNT(DISTINCT nationality) AS nationality_count FROM aixpay_wallet.wallet_application WHERE nationality IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 20 | `passport_request_id_saved` | 写入 passport_request_id | 无单独页面动作；这是请求 passport URL 成功后的系统结果。 | 后端保存 passport request_id，并把主申请状态置为处理中。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`passport_request_id IS NOT NULL`；同时 `passport_status` 初始化、`kyc_status = 1/PROCESSING`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE passport_request_id IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 27 | `liveness_request_id_saved` | 写入 liveness_request_id | 无单独页面动作；这是请求 liveness URL 成功后的系统结果。 | 后端保存 liveness request_id，并把主申请状态置为处理中。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`liveness_request_id IS NOT NULL`；同时 `liveness_status` 初始化、`kyc_status = 1/PROCESSING`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE liveness_request_id IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 31 | `passport_or_liveness_processing` | 证件/活体处理中 | 轮询页显示处理中，并继续轮询。 | 后端判断 passport 或 liveness 仍在处理中，返回 `PROCESSING`。 | ✅ 可直接查 | 业务表可查 `passport_status=1` 或 `liveness_status=1`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE (passport_status = 1 OR liveness_status = 1) AND update_time >= '2026-03-01 00:00:00';` |
| 32 | `passport_or_liveness_failed` | 证件/活体失败 | 轮询页进入失败状态，展示失败原因和下一步引导。 | 后端判断 passport 或 liveness 失败，返回 `KYC_FAILED`。 | ✅ 可直接查 | `wallet_application.passport_status=2` 或 `liveness_status=2`；如需要子项明细可另查 `kyc_info_record`，但主表 SQL 先保留在 `wallet_application`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE (passport_status = 2 OR liveness_status = 2) AND update_time >= '2026-03-01 00:00:00';` |
| 40 | `poa_upload_success_frontend` | 前端上传成功，拿到 fileId/fileUrl | POA 文件上传成功后，页面展示文件卡片，Continue 按钮可提交。 | 后端返回 fileId/fileUrl；同时创建 POA 记录、保存 OSS 文件，并更新主申请 POA request_id / 状态。 | ✅ 可直接查 | 业务表可看 `wallet_application.poa_request_id IS NOT NULL` 或 POA 状态字段。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE poa_request_id IS NOT NULL AND update_time >= '2026-03-01 00:00:00';` |
| 43 | `kyc_application_under_review` | KYC 完整提交，进入审核 | POA confirm 成功后，App 跳转 KYC 提交结果页。 | 后端把 KYC 主申请状态更新为 `UNDER_REVIEW`。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 2`；时间字段优先 `update_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 2 AND update_time >= '2026-03-01 00:00:00';` |
| 45 | `kyc_final_approved` | 最终 KYC 通过 | 无直接前端动作；用户状态由后端审核结果决定。 | 后端获取 DTC 审核结果后，把 `wallet_application.kyc_status` 更新为成功。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 5`；时间字段 `finished_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 5 AND COALESCE(finished_time, update_time) >= '2026-03-01 00:00:00';` |
| 46 | `kyc_final_failed` | 最终 KYC 失败 | 无直接前端动作；用户状态由后端审核结果或异常处理决定。 | 后端获取 DTC 审核结果或处理异常后，把 `wallet_application.kyc_status` 更新为失败。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 3`；时间字段 `finished_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 3 AND COALESCE(finished_time, update_time) >= '2026-03-01 00:00:00';` |
| 47 | `kyc_final_rejected` | 最终 KYC 拒绝 | 无直接前端动作；用户状态由后端审核结果决定。 | 后端获取 DTC 审核结果后，把 `wallet_application.kyc_status` 更新为拒绝。 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 4`；时间字段 `finished_time`。 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | aixpay_wallet.wallet_application | `SELECT COUNT(*) AS application_count, COUNT(DISTINCT user_id) AS user_count FROM aixpay_wallet.wallet_application WHERE kyc_status = 4 AND COALESCE(finished_time, update_time) >= '2026-03-01 00:00:00';` |

## 当前可直接写 SQL 的核心节点

| 节点 | 实例 | 表 | 条件 |
|---|---|---|---|
| 协议确认 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_app.user_agreement_consent` | `location = 'KYC_START'` |
| KYC 主申请创建 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `user_id` 有记录 |
| 国家提交成功 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `nationality` 写入后可见；单用户排查先不加 `nationality IS NOT NULL` |
| Passport 开始 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `passport_request_id IS NOT NULL` |
| Passport 状态 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `passport_status` |
| Liveness 开始 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `liveness_request_id IS NOT NULL` |
| Liveness 状态 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `liveness_status` |
| POA 上传成功结果 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `poa_request_id IS NOT NULL` |
| POA 状态 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `poa_status` |
| 进入审核 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `kyc_status = 2` |
| 最终通过 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `kyc_status = 5` |
| 最终失败 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `kyc_status = 3` |
| 最终拒绝 | SG-AIX-AIXPAY-A-OB-MASTER-AWS | `aixpay_wallet.wallet_application` | `kyc_status = 4` |

## 统计 SQL

### KYC 主申请总览

```sql
SELECT
  COUNT(*) AS total_wallet_application,
  COUNT(DISTINCT user_id) AS total_users,
  SUM(CASE WHEN nationality IS NULL THEN 1 ELSE 0 END) AS nationality_null_count,
  SUM(CASE WHEN nationality IS NOT NULL THEN 1 ELSE 0 END) AS nationality_not_null_count,
  ROUND(SUM(CASE WHEN nationality IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS nationality_not_null_rate
FROM aixpay_wallet.wallet_application
WHERE create_time >= '2026-03-01 00:00:00';
```

### 按 KYC 状态统计

```sql
SELECT
  kyc_status,
  COUNT(*) AS application_count,
  COUNT(DISTINCT user_id) AS user_count,
  SUM(CASE WHEN nationality IS NULL THEN 1 ELSE 0 END) AS nationality_null_count,
  SUM(CASE WHEN nationality IS NOT NULL THEN 1 ELSE 0 END) AS nationality_not_null_count
FROM aixpay_wallet.wallet_application
WHERE create_time >= '2026-03-01 00:00:00'
GROUP BY kyc_status
ORDER BY application_count DESC;
```

### 按国家统计已写入国家的 KYC 主申请

```sql
SELECT
  nationality,
  COUNT(*) AS application_count,
  COUNT(DISTINCT user_id) AS user_count
FROM aixpay_wallet.wallet_application
WHERE nationality IS NOT NULL
  AND update_time >= '2026-03-01 00:00:00'
GROUP BY nationality
ORDER BY application_count DESC;
```

### 2026-03-01 至今 KYC 主申请与国家写入情况

```sql
SELECT
  DATE(create_time) AS dt,
  COUNT(*) AS application_count,
  COUNT(DISTINCT user_id) AS user_count,
  SUM(CASE WHEN nationality IS NULL THEN 1 ELSE 0 END) AS nationality_null_count,
  SUM(CASE WHEN nationality IS NOT NULL THEN 1 ELSE 0 END) AS nationality_not_null_count
FROM aixpay_wallet.wallet_application
WHERE create_time >= '2026-03-01 00:00:00'
GROUP BY DATE(create_time)
ORDER BY dt DESC;
```

### 进入 KYC 但未提交国家的用户量

```sql
SELECT
  COUNT(*) AS application_count,
  COUNT(DISTINCT user_id) AS user_count
FROM aixpay_wallet.wallet_application
WHERE nationality IS NULL
  AND create_time >= '2026-03-01 00:00:00';
```

### 2026-03-01 至今进入 KYC 但未提交国家的每日统计

```sql
SELECT
  DATE(create_time) AS create_date,
  COUNT(*) AS application_count,
  COUNT(DISTINCT user_id) AS user_count
FROM aixpay_wallet.wallet_application
WHERE nationality IS NULL
  AND create_time >= '2026-03-01 00:00:00'
GROUP BY DATE(create_time)
ORDER BY create_date DESC;
```

### 2026-03-01 至今已提交国家的每日统计

```sql
SELECT
  DATE(update_time) AS update_date,
  COUNT(*) AS application_count,
  COUNT(DISTINCT user_id) AS user_count,
  COUNT(DISTINCT nationality) AS nationality_count
FROM aixpay_wallet.wallet_application
WHERE nationality IS NOT NULL
  AND update_time >= '2026-03-01 00:00:00'
GROUP BY DATE(update_time)
ORDER BY update_date DESC;
```

## 当前账号无权限直接查询的日志类节点

这些节点的事实来源应是后端明细日志或接口返回，但当前账号没有可用的日志明细权限表，因此不列正式 SQL：

| 节点 | 原因 |
|---|---|
| KYC start 接口 | 需要后端明细日志权限 |
| KYC start route 决策 | 需要后端明细日志权限 |
| 国家列表加载 | 需要后端明细日志权限 |
| Start 页提交 | 需要后端明细日志权限 |
| Passport Guide route 返回 | 需要后端明细日志权限 |
| Passport URL 获取 | 需要后端明细日志权限 |
| Liveness URL 获取 | 需要后端明细日志权限 |
| Passport + Face 轮询 | 需要后端明细日志权限 |
| POA route 返回 | 需要后端明细日志权限 |
| POA 文件上传 | 需要后端明细日志权限 |
| POA confirm | 需要后端明细日志权限 |
