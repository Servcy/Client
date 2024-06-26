import Link from "next/link"
import { useParams } from "next/navigation"

import { FC, ReactNode } from "react"

import { observer } from "mobx-react-lite"

import { NotAuthorizedView } from "@components/auth-screens"

import { useUser } from "@hooks/store"

import { ERoles } from "@constants/iam"

import { Button, LayersIcon } from "@servcy/ui"

import { ProjectSettingsSidebar } from "./sidebar"

export interface IProjectSettingLayout {
    children: ReactNode
}

export const ProjectSettingLayout: FC<IProjectSettingLayout> = observer((props) => {
    const { children } = props
    const params = useParams()
    const { workspaceSlug, projectId } = params
    // store hooks
    const {
        membership: { currentProjectRole },
    } = useUser()

    const restrictViewSettings = currentProjectRole !== undefined && currentProjectRole <= ERoles.MEMBER

    return restrictViewSettings ? (
        <NotAuthorizedView
            type="project"
            actionButton={
                //TODO: Create a new component called Button Link to handle such scenarios
                <Link href={`/${workspaceSlug}/projects/${projectId}/issues`}>
                    <Button variant="primary" size="md" prependIcon={<LayersIcon />}>
                        Go to issues
                    </Button>
                </Link>
            }
        />
    ) : (
        <div className="inset-y-0 z-20 flex flex-grow-0 h-full w-full">
            <div className="w-80 flex-shrink-0 overflow-y-hidden pt-8 sm:hidden hidden md:block lg:block">
                <ProjectSettingsSidebar />
            </div>
            <div className="w-full pl-10 sm:pl-10 md:pl-0 lg:pl-0 overflow-x-hidden overflow-y-scroll">{children}</div>
        </div>
    )
})
