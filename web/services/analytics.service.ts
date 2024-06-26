import { APIService } from "@services/api.service"

import { API_BASE_URL } from "@helpers/common.helper"

import {
    IAnalyticsParams,
    IAnalyticsResponse,
    IDefaultAnalyticsResponse,
    IExportAnalyticsFormData,
    ITimesheetAnalyticsResponse,
} from "@servcy/types"

export class AnalyticsService extends APIService {
    constructor() {
        super(API_BASE_URL)
    }

    async getAnalytics(workspaceSlug: string, params: IAnalyticsParams): Promise<IAnalyticsResponse> {
        return this.get(`/dashboard/${workspaceSlug}/analytics`, {
            params: {
                ...params,
                project: params?.project ? params.project.toString() : null,
            },
        })
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getDefaultAnalytics(
        workspaceSlug: string,
        params?: Partial<IAnalyticsParams>
    ): Promise<IDefaultAnalyticsResponse> {
        return this.get(`/dashboard/${workspaceSlug}/default-analytics`, {
            params: {
                ...params,
                project_id: params?.project ? params.project.toString() : null,
            },
        })
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getTimesheetAnalytics(workspaceSlug: string, activeLayout: string): Promise<ITimesheetAnalyticsResponse> {
        return this.get(`/dashboard/${workspaceSlug}/timesheet-analytics/${activeLayout}`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async exportAnalytics(workspaceSlug: string, data: IExportAnalyticsFormData): Promise<any> {
        return this.post(`/dashboard/${workspaceSlug}/export-analytics`, data)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }
}
