import { usePathname } from "next/navigation"

import { useRef } from "react"

import { observer } from "mobx-react"

import { useEventTracker } from "@hooks/store"

import { SPREADSHEET_PROPERTY_DETAILS } from "@constants/spreadsheet"

import { IIssueDisplayProperties, TIssue } from "@servcy/types"

import { WithDisplayPropertiesHOC } from "../properties/with-display-properties-HOC"
import { EIssueActions } from "../types"

type Props = {
    displayProperties: IIssueDisplayProperties
    issueDetail: TIssue
    disableUserActions: boolean
    property: keyof IIssueDisplayProperties
    handleIssues: (issue: TIssue, action: EIssueActions) => Promise<void>
    isEstimateEnabled: boolean
}

export const IssueColumn = observer((props: Props) => {
    const pathname = usePathname()
    const { displayProperties, issueDetail, disableUserActions, property, handleIssues, isEstimateEnabled } = props
    const tableCellRef = useRef<HTMLTableCellElement | null>(null)
    const { captureIssueEvent } = useEventTracker()

    const shouldRenderProperty = property === "estimate" ? isEstimateEnabled : true

    const { Column } = SPREADSHEET_PROPERTY_DETAILS[property]

    return (
        <WithDisplayPropertiesHOC
            displayProperties={displayProperties}
            displayPropertyKey={property}
            shouldRenderProperty={() => shouldRenderProperty}
        >
            <td
                tabIndex={0}
                className="h-11 w-full min-w-[8rem] bg-custom-background-100 text-sm after:absolute after:w-full after:bottom-[-1px] after:border after:border-custom-border-100 border-r-[1px] border-custom-border-100"
                ref={tableCellRef}
            >
                <Column
                    issue={issueDetail}
                    onChange={(issue: TIssue, data: Partial<TIssue>, updates: any) =>
                        handleIssues({ ...issue, ...data }, EIssueActions.UPDATE).then(() => {
                            captureIssueEvent({
                                eventName: "Issue updated",
                                payload: {
                                    ...issue,
                                    ...data,
                                    element: "Spreadsheet layout",
                                },
                                updates: updates,
                                path: pathname,
                            })
                        })
                    }
                    disabled={disableUserActions}
                    onClose={() => {
                        tableCellRef?.current?.focus()
                    }}
                />
            </td>
        </WithDisplayPropertiesHOC>
    )
})
