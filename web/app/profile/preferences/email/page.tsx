"use client"

import useSWR from "swr"

import { PageHead } from "@components/core"
import { EmailNotificationForm } from "@components/profile/preferences"
import { EmailSettingsLoader } from "@components/ui"

import { UserService } from "@services/user.service"

import { ProfilePreferenceSettingsWrapper } from "@wrappers/settings/profile/preferences"

const userService = new UserService()

const ProfilePreferencesEmailPage = () => {
    // fetching user email notification settings
    const { data, isLoading } = useSWR("CURRENT_USER_EMAIL_NOTIFICATION_SETTINGS", () =>
        userService.currentUserEmailNotificationSettings()
    )

    if (!data || isLoading) {
        return <EmailSettingsLoader />
    }

    return (
        <ProfilePreferenceSettingsWrapper>
            <PageHead title="Profile - Email Preference" />
            <div className="mx-auto mt-8 h-full w-full overflow-y-auto px-6 lg:px-20 pb-8">
                <EmailNotificationForm data={data} />
            </div>
        </ProfilePreferenceSettingsWrapper>
    )
}

export default ProfilePreferencesEmailPage
