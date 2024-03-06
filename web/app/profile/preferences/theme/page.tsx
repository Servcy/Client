"use client"

import { useEffect, useState } from "react"

import { NextPageWithLayout } from "@/types/index"
import { observer } from "mobx-react-lite"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"

import { CustomThemeSelector, PageHead, ThemeSwitch } from "@components/core"

import { useUser } from "@hooks/store"

import { ProfilePreferenceSettingsLayout } from "@wrappers/settings/profile/preferences"

import { I_THEME_OPTION, THEME_OPTIONS } from "@constants/themes"

import { Spinner } from "@servcy/ui"

const ProfilePreferencesThemePage: NextPageWithLayout = observer(() => {
    // states
    const [currentTheme, setCurrentTheme] = useState<I_THEME_OPTION | null>(null)
    // store hooks
    const { currentUser, updateCurrentUserTheme } = useUser()
    // computed
    const userTheme = currentUser?.theme

    const { setTheme } = useTheme()

    useEffect(() => {
        if (userTheme) {
            const userThemeOption = THEME_OPTIONS.find((t) => t.value === userTheme?.theme)
            if (userThemeOption) {
                setCurrentTheme(userThemeOption)
            }
        }
    }, [userTheme])

    const handleThemeChange = (themeOption: I_THEME_OPTION) => {
        setTheme(themeOption.value)
        updateCurrentUserTheme(themeOption.value).catch(() => {
            toast.error("Failed to Update the theme")
        })
    }

    return (
        <ProfilePreferenceSettingsLayout>
            <PageHead title="Profile - Theme Prefrence" />
            {currentUser ? (
                <div className="mx-auto mt-10 md:mt-14 h-full w-full overflow-y-auto px-6 lg:px-20 pb-8">
                    <div className="flex items-center border-b border-custom-border-100 pb-3.5">
                        <h3 className="text-xl font-medium">Preferences</h3>
                    </div>
                    <div className="grid grid-cols-12 gap-4 py-6 sm:gap-16">
                        <div className="col-span-12 sm:col-span-6">
                            <h4 className="text-lg font-semibold text-custom-text-100">Theme</h4>
                            <p className="text-sm text-custom-text-200">
                                Select or customize your interface color scheme.
                            </p>
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <ThemeSwitch value={currentTheme} onChange={handleThemeChange} />
                        </div>
                    </div>
                    {userTheme?.theme === "custom" && <CustomThemeSelector />}
                </div>
            ) : (
                <div className="grid h-full w-full place-items-center px-4 sm:px-0">
                    <Spinner />
                </div>
            )}
        </ProfilePreferenceSettingsLayout>
    )
})

ProfilePreferencesThemePage.hasWrapper = true

export default ProfilePreferencesThemePage