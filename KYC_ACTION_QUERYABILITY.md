# KYC Action 可查询性核查表

用于管理 AIX KYC 全流程 action、可查询性、数据来源与口径风险。

## 可查询性枚举

| 标记 | 含义 |
|---|---|
| ✅ 可直接查 | 业务表或后端接口日志能明确查询 |
| ⚠️ 需确认埋点落表 | AIX 前端代码已确认有 PageEvent 或 sendEvent，但尚未确认具体 Doris / 事件表 |
| 🟡 可推断查 | 没有独立事件，只能用页面曝光、接口调用或状态组合近似 |
| ❌ 不能直接查 | 仅前端临时状态，未看到明确埋点或业务落库 |

## 重要口径说明

- `/aix/kyc/success` / `OpenWalletSubmitResult` 不是最终 KYC 通过，只能视为「提交结果页 / 已进入审核」。
- 最终 KYC 通过必须以 `aixpay_wallet.wallet_application.kyc_status = 5` 为准。
- POA 是条件分支，不能默认放进所有用户的主漏斗。
- 前端行为类 action 需要先确认埋点最终落表，才能写统计 SQL。

## KYC Action 可查询性核查表

| 顺序 | Action Code | Action 含义 | 能否查 | 清晰数据来源 / 查询条件 |
|---:|---|---|---|---|
| 1 | `kyc_launch_enter` | 进入 KYC Launch loading | ⚠️ 需确认埋点落表 | 前端自动 PageEvent；路由 `/aix/kyc/launch`。代码确认有页面，但 `PageNameMap` 未看到 KycLaunch 映射 |
| 2 | `kyc_start_api_called` | 调用 KYC start 接口 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/start`；日志关键词 `WalletController#startKyc` |
| 3 | `kyc_start_route_decided` | 后端返回下一步 route code | ✅ 可直接查 | Doris 后端日志：`WalletController#startKyc` result；返回 code 如 `ROUTE_KYC_START_PAGE / ROUTE_PASSPORT_PAGE / ROUTE_POA_PAGE` |
| 4 | `kyc_start_page_view` | 进入 KYC Start Page | ⚠️ 需确认埋点落表 | 前端自动 PageEvent；路由 `/aix/kyc/start`；PageName = `StartIdentityVerification` |
| 5 | `kyc_country_select_open` | 点击国家输入框进入国家列表 | 🟡 可推断查 | 没看到独立 click 埋点；可用国家选择页 PageEvent 近似：路由 `/aix/kyc/supported-region-select` |
| 6 | `kyc_region_list_loaded` | 国家列表加载成功 | ✅ 可直接查接口日志 | 接口：`GET /api/config/phone-area-list/kyc-start-page`；不能代表用户选择，只代表列表请求 |
| 7 | `kyc_region_click` | 点击选择国家 | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.RegionClick`，extra.region = countryISO |
| 8 | `kyc_region_selected_back_to_start` | 国家回填 Start 页 | ❌ 不能直接查 | 只是 `DeviceEventEmitter` 前端状态回传，无独立业务落库 |
| 9 | `kyc_agreement_checkbox_click` | 点选协议 checkbox | ❌ 不能直接查 | Contract 组件有 checkbox UI，但未看到独立 `sendEvent` |
| 10 | `kyc_agreement_all_selected` | 协议全部勾选完成 | ❌ 不能直接查 | 只是前端 `isAgreed` 状态，无业务落库 |
| 11 | `kyc_start_continue_click` | Start 页点击 Continue | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.NextClick`，extra.region = selectedCountry |
| 12 | `kyc_start_page_submit_api` | 提交国家 + 协议确认 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/start-page/submit`；日志关键词 `WalletController#startKycPageSubmit` |
| 13 | `kyc_agreement_saved` | KYC_START 协议落库 | ✅ 可直接查 | `aixpay_app.user_agreement_consent`：`location = 'KYC_START'`，时间字段 `consented_at` |
| 14 | `wallet_application_created_or_loaded` | 创建或获取 KYC 主申请 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：按 `user_id` 查记录；时间字段 `create_time` |
| 15 | `kyc_country_saved_to_wallet_application` | 国家写入 KYC 申请 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`nationality IS NOT NULL`；Start 页 submit 后写入 |
| 16 | `route_to_passport_guide` | 跳转 Passport Guide | 🟡 可推断查 | 后端返回 `ROUTE_PASSPORT_PAGE` 可在接口日志查；页面曝光需前端埋点表 |
| 17 | `passport_guide_page_view` | 进入证件引导页 | ⚠️ 需确认埋点落表 | 前端自动 PageEvent；路由 `/aix/kyc/passport-guide`；PageName = `TakeIdPhoto` |
| 18 | `passport_start_verify_click` | 点击开始证件验证 | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.StartVerifyClick` |
| 19 | `passport_get_url_api` | 请求 passport AAI URL | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/passport/get-url`；日志关键词 `WalletController#getPassportUrl` |
| 20 | `passport_request_id_saved` | 写入 passport_request_id | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`passport_request_id IS NOT NULL`；同时 `passport_status` 初始化、`kyc_status = 1/PROCESSING` |
| 21 | `passport_scan_page_view` | 进入 passport WebView 扫描页 | ⚠️ 需确认埋点落表 | 前端自动 PageEvent；路由 `/aix/kyc/passport-scan`；PageName = `TakeIdPhotoResult` |
| 22 | `passport_verify_result_success` | Passport WebView 成功 | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.VerifyResult` + `status = Success`；业务侧可用 passport 状态成功近似 |
| 23 | `passport_verify_result_failed` | Passport WebView 失败 | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.VerifyResult` + `status = Failure`；业务侧可用 passport 状态失败近似 |
| 24 | `face_guide_page_view` | 进入 Face Guide | ❌ 不能确认直接查 | 页面存在，路由 `/aix/kyc/face-guide`；但 `PageNameMap` 没有 KycFaceGuide 映射 |
| 25 | `face_continue_click` | Face Guide 点击 Continue | ❌ 不能直接查 | 代码有点击逻辑，但未看到 `sendEvent` |
| 26 | `liveness_get_url_api` | 请求 liveness AAI URL | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/liveness/get-url`；日志关键词 `WalletController#getLivenessUrl` |
| 27 | `liveness_request_id_saved` | 写入 liveness_request_id | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`liveness_request_id IS NOT NULL`；同时 `liveness_status` 初始化、`kyc_status = 1/PROCESSING` |
| 28 | `face_scan_page_view` | 进入 Face Scan WebView | ❌ 不能确认直接查 | 页面存在，路由 `/aix/kyc/face-scan`；但 `PageNameMap` 没有 KycFaceScan 映射 |
| 29 | `face_scan_finished` | Face WebView 完成，成功/失败都进轮询 | 🟡 可推断查 | 前端未看到 `sendEvent`；可用后续 `/loading-passport-face-result` 轮询开始近似 |
| 30 | `passport_face_result_polling` | 轮询 passport + face 结果 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/loading-passport-face-result`；日志关键词 `WalletController#checkLoadingPassportFaceResult` |
| 31 | `passport_or_liveness_processing` | 证件/活体处理中 | ✅ 可直接查 | 接口日志返回 `PROCESSING`；业务表可查 `passport_status=1` 或 `liveness_status=1` |
| 32 | `passport_or_liveness_failed` | 证件/活体失败 | ✅ 可直接查 | `wallet_application.passport_status=2` 或 `liveness_status=2`；也可查 `kyc_info_record.status=2` |
| 33 | `route_to_poa_page` | 进入 POA 分支 | 🟡 可推断查 | 接口日志返回 `ROUTE_POA_PAGE` 最准；业务表可用 passport/liveness 成功且 POA 需要处理近似 |
| 34 | `poa_page_view` | 进入 POA 页面 | ⚠️ 需确认埋点落表 | 前端自动 PageEvent；路由 `/aix/kyc/poa`；PageName = `AddressUpload` |
| 35 | `poa_country_select_open` | POA 页打开国家选择 | 🟡 可推断查 | 没看到独立 click 埋点；可用国家选择页 PageEvent 近似 |
| 36 | `poa_upload_click` | 点击 POA Upload | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.UploadClick` |
| 37 | `poa_select_upload_type` | 选择上传类型 files/album | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.SelectUploadType`，extra.fileType |
| 38 | `poa_take_photo_click` | 点击拍照上传 | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.TakePhotoClick` |
| 39 | `poa_file_upload_api` | POA 文件上传 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/poa/upload`；日志关键词 `WalletController#poaUpload` |
| 40 | `poa_upload_success_frontend` | 前端上传成功，拿到 fileId/fileUrl | 🟡 可推断查 | 后端接口 `/poa/upload` 成功返回可近似；前端 state 本身不能直接查 |
| 41 | `poa_submit_click` | 点击 POA Continue/Submit | ⚠️ 需确认埋点落表 | 前端手动埋点：`Action.SubmitClick` |
| 42 | `poa_confirm_api` | POA confirm 提交 | ✅ 可直接查 | Doris 后端日志：`/api/wallet/kyc/poa/confirm`；日志关键词 `WalletController#poaConfirm` |
| 43 | `kyc_application_under_review` | KYC 完整提交，进入审核 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 2`；时间字段优先 `update_time` |
| 44 | `kyc_submit_result_page_view` | 进入提交结果页 | ⚠️ 需确认埋点落表 | 前端自动 PageEvent；路由 `/aix/kyc/success`；PageName = `OpenWalletSubmitResult`。注意不是最终 KYC 通过 |
| 45 | `kyc_final_approved` | 最终 KYC 通过 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 5`；时间字段 `finished_time` |
| 46 | `kyc_final_failed` | 最终 KYC 失败 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 3`；时间字段 `finished_time` |
| 47 | `kyc_final_rejected` | 最终 KYC 拒绝 | ✅ 可直接查 | `aixpay_wallet.wallet_application`：`kyc_status = 4`；时间字段 `finished_time` |

## 当前可直接写 SQL 的核心节点

| 节点 | 表 / 日志 | 条件 |
|---|---|---|
| 协议确认 | `aixpay_app.user_agreement_consent` | `location = 'KYC_START'` |
| KYC 主申请创建 | `aixpay_wallet.wallet_application` | `user_id` 有记录 |
| 国家提交成功 | `wallet_application` | `nationality IS NOT NULL` |
| Passport 开始 | `wallet_application` | `passport_request_id IS NOT NULL` |
| Passport 状态 | `wallet_application` / `kyc_info_record` | `passport_status` 或 `type = 1` |
| Liveness 开始 | `wallet_application` | `liveness_request_id IS NOT NULL` |
| Liveness 状态 | `wallet_application` / `kyc_info_record` | `liveness_status` 或 `type IN (2,3)` |
| POA 状态 | `wallet_application` / `kyc_info_record` | `poa_status` 或 `type = 4` |
| 进入审核 | `wallet_application` | `kyc_status = 2` |
| 最终通过 | `wallet_application` | `kyc_status = 5` |
| 最终失败 | `wallet_application` | `kyc_status = 3` |
| 最终拒绝 | `wallet_application` | `kyc_status = 4` |
