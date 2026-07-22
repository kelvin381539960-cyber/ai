
import { getLocale } from "@/i18n/I18nRuntime";
import { getAppFlyerId } from "@/third-party/apps-flyer/AppFlyerData";
import NativeAIXDeviceInfo from "@specs/NativeAIXDeviceInfo";
import { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { getManufacturerSync, getModel } from 'react-native-device-info'

export function getUserAgent() {
    const part: string[] = []
    part.push('AIX (')
    if (Platform.OS == 'ios') {
        part.push('ios; ')
    } else if (Platform.OS == 'android') {
        part.push('Android; ')
    } else {
        part.push('Unknown; ')
    }
    part.push(getSystemInfo() + '; ')
    part.push(getSystemVersion() + '; ')
    part.push(getLanguage())
    part.push(')' + ' ')
    part.push('uuid/' + NativeAIXDeviceInfo.getDeviceId() + ' ')
    part.push('adid/' + getAdId() + ' ')
    part.push('version/' + NativeAIXDeviceInfo.getAppVersion())

    const afid = getAppflyerId()
    if (afid) {
        part.push(' afid/' + afid)
    }

    return part.join('');
}

function getSystemInfo(): string {

    return getManufacturerSync() + ' ' + getModel()
}

function getSystemVersion(): string {
    return String(Platform.Version ?? 'web')
}

function getLanguage(): string {
    return getLocale();
}

function getAdId(): string {
    return getAppFlyerId() ?? ''
}

function getAppflyerId(): string | undefined {
    return getAppFlyerId();
}



export class AixUserAgent {

    installIn(instance: AxiosInstance) {
        instance.interceptors.request.use((config) => {
            config.headers['x-user-agent'] = getUserAgent();
            config.headers['Accept-Language'] = getLocale();
            const ct = config.headers?.["Content-Type"] ?? config.headers?.["content-type"];
            if (!ct) {
                config.headers["Content-Type"] = "application/json";
            }
            config.headers['device-id'] = NativeAIXDeviceInfo.getDeviceId()
            return config;
        });
    }
}