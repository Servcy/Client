import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

import React from "react"

import { ProfileIssuesFilter } from "@components/profile"

import { PROFILE_ADMINS_TAB, PROFILE_VIEWER_TAB } from "@constants/profile"

type Props = {
    isAuthorized: boolean
    showProfileIssuesFilter?: boolean
}

export const ProfileNavbar: React.FC<Props> = (props) => {
    const { isAuthorized, showProfileIssuesFilter } = props

    const pathname = usePathname()
    const { workspaceSlug, userId } = useParams()

    const tabsList = isAuthorized ? [...PROFILE_VIEWER_TAB, ...PROFILE_ADMINS_TAB] : PROFILE_VIEWER_TAB

    return (
        <div className="sticky -top-0.5 z-10 hidden md:flex items-center justify-between gap-4 border-b border-custom-border-300 bg-custom-background-100 px-4 sm:px-5 md:static">
            <div className="flex items-center overflow-x-scroll">
                {tabsList.map((tab) => (
                    <Link key={tab.route} href={`/${workspaceSlug}/profile/${userId}/${tab.route}`}>
                        <span
                            className={`flex whitespace-nowrap border-b-2 p-4 text-sm font-medium outline-none ${
                                pathname === tab.selected
                                    ? "border-custom-primary-100 text-custom-primary-100"
                                    : "border-transparent"
                            }`}
                        >
                            {tab.label}
                        </span>
                    </Link>
                ))}
            </div>
            {showProfileIssuesFilter && <ProfileIssuesFilter />}
        </div>
    )
}
