import { usePathname } from "next/navigation"

import { observer } from "mobx-react-lite"

import { ProfileNavbar, ProfileSidebar } from "@components/profile"

import { useUser } from "@hooks/store"

type Props = {
    children: React.ReactNode
    className?: string
    showProfileIssuesFilter?: boolean
}

const AUTHORIZED_ROLES = [3, 2, 1]

const ProfileAuthWrapper: React.FC<Props> = observer((props) => {
    const { children, className, showProfileIssuesFilter } = props
    const pathname = usePathname()

    const {
        membership: { currentWorkspaceRole },
    } = useUser()

    if (!currentWorkspaceRole) return null

    const isAuthorized = AUTHORIZED_ROLES.includes(currentWorkspaceRole)

    const isAuthorizedPath = pathname.includes("assigned" || "created" || "subscribed")

    return (
        <div className="h-full w-full md:flex md:flex-row-reverse md:overflow-hidden">
            <ProfileSidebar />
            <div className="flex w-full flex-col md:h-full md:overflow-hidden">
                <ProfileNavbar isAuthorized={isAuthorized} showProfileIssuesFilter={showProfileIssuesFilter} />
                {isAuthorized || !isAuthorizedPath ? (
                    <div className={`w-full overflow-hidden md:h-full ${className}`}>{children}</div>
                ) : (
                    <div className="grid h-full w-full place-items-center text-custom-text-200">
                        You do not have the permission to access this page.
                    </div>
                )}
            </div>
        </div>
    )
})

export default ProfileAuthWrapper
