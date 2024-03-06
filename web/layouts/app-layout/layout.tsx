import { FC, ReactNode } from "react"

import { observer } from "mobx-react-lite"

import { CommandPalette } from "@components/command-palette"

import { ProjectAuthWrapper, UserAuthWrapper, WorkspaceAuthWrapper } from "@layouts/auth-layout"

import { AppSidebar } from "./sidebar"

export interface IAppLayout {
    children: ReactNode
    header: ReactNode
    withProjectWrapper?: boolean
}

export const AppLayout: FC<IAppLayout> = observer((props) => {
    const { children, header, withProjectWrapper = false } = props

    return (
        <>
            <CommandPalette />
            <UserAuthWrapper>
                <WorkspaceAuthWrapper>
                    <div className="relative flex h-screen w-full overflow-hidden">
                        <AppSidebar />
                        <main className="relative flex h-full w-full flex-col overflow-hidden bg-custom-background-100">
                            {header}
                            <div className="h-full w-full overflow-hidden">
                                <div className="relative h-full w-full overflow-x-hidden overflow-y-scroll">
                                    {withProjectWrapper ? (
                                        <ProjectAuthWrapper>{children}</ProjectAuthWrapper>
                                    ) : (
                                        <>{children}</>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </WorkspaceAuthWrapper>
            </UserAuthWrapper>
        </>
    )
})
