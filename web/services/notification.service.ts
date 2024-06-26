import { APIService } from "@services/api.service"

import { API_BASE_URL } from "@helpers/common.helper"

import type {
    IMarkAllAsReadPayload,
    INotificationParams,
    IUserNotification,
    NotificationCount,
    PaginatedUserNotification,
} from "@servcy/types"

export class NotificationService extends APIService {
    constructor() {
        super(API_BASE_URL)
    }

    // notification routes

    async getUserNotifications(workspaceSlug: string, params: INotificationParams): Promise<IUserNotification[]> {
        return this.get(`/notification/${workspaceSlug}`, {
            params,
        })
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getUserNotificationDetailById(workspaceSlug: string, notificationId: string): Promise<IUserNotification> {
        return this.get(`/notification/${workspaceSlug}/${notificationId}`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async markUserNotificationAsRead(workspaceSlug: string, notificationId: string): Promise<IUserNotification> {
        return this.post(`/notification/${workspaceSlug}/${notificationId}/read`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async markUserNotificationAsUnread(workspaceSlug: string, notificationId: string): Promise<IUserNotification> {
        return this.delete(`/notification/${workspaceSlug}/${notificationId}/read`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async markUserNotificationAsArchived(workspaceSlug: string, notificationId: string): Promise<IUserNotification> {
        return this.post(`/notification/${workspaceSlug}/${notificationId}/archive`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async markUserNotificationAsUnarchived(workspaceSlug: string, notificationId: string): Promise<IUserNotification> {
        return this.delete(`/notification/${workspaceSlug}/${notificationId}/archive`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async patchUserNotification(
        workspaceSlug: string,
        notificationId: string,
        data: Partial<IUserNotification>
    ): Promise<IUserNotification> {
        return this.patch(`/notification/${workspaceSlug}/${notificationId}`, data)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async markAllNotificationsAsRead(workspaceSlug: string, payload: IMarkAllAsReadPayload): Promise<any> {
        return this.post(`/notification/${workspaceSlug}/read`, {
            ...payload,
        })
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async deleteUserNotification(workspaceSlug: string, notificationId: string): Promise<any> {
        return this.delete(`/notification/${workspaceSlug}/${notificationId}`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getUnreadNotificationsCount(workspaceSlug: string): Promise<NotificationCount> {
        return this.get(`/notification/${workspaceSlug}/unread`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getNotifications(url: string): Promise<PaginatedUserNotification> {
        return this.get(url)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    // end of notification routes

    async subscribeToIssueNotifications(workspaceSlug: string, projectId: string, issueId: string): Promise<any> {
        return this.post(`/project/${workspaceSlug}/${projectId}/issues/${issueId}/subscribe/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getIssueNotificationSubscriptionStatus(
        workspaceSlug: string,
        projectId: string,
        issueId: string
    ): Promise<{
        subscribed: boolean
    }> {
        return this.get(`/project/${workspaceSlug}/${projectId}/issues/${issueId}/subscribe/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async unsubscribeFromIssueNotifications(workspaceSlug: string, projectId: string, issueId: string): Promise<any> {
        return this.delete(`/project/${workspaceSlug}/${projectId}/issues/${issueId}/subscribe/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }
}
