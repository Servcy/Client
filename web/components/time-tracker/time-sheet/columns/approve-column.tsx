import { useParams } from "next/navigation"

import { FC } from "react"

import { BadgeCheck, CircleDotDashed } from "lucide-react"
import toast from "react-hot-toast"

import { useTimeTracker, useUser } from "@hooks/store"

import { ITrackedTime } from "@servcy/types"
import { CustomSelect } from "@servcy/ui"

export const ApprovalColumn: FC<{
    tableCellRef: React.RefObject<HTMLTableCellElement>
    timeLog: ITrackedTime
}> = ({ tableCellRef, timeLog }) => {
    const { workspaceSlug } = useParams()
    const { updateTimeLog } = useTimeTracker()
    const { currentUser } = useUser()
    return (
        <td
            tabIndex={0}
            className="h-11 w-full min-w-[8rem] bg-custom-background-100 text-sm after:absolute after:w-full after:bottom-[-1px] after:border after:border-custom-border-100 border-r-[1px] border-custom-border-100"
            ref={tableCellRef}
        >
            <div className="h-11 border-b-[0.5px] border-custom-border-200 flex items-center">
                <CustomSelect
                    customButton={
                        <div className="flex gap-x-2 py-2 px-4 items-center">
                            {timeLog.is_approved ? (
                                <BadgeCheck className="size-4 text-custom-primary-100" />
                            ) : (
                                <CircleDotDashed className="size-4 text-amber-700" />
                            )}
                            <div>{timeLog.is_approved ? "Approved" : "In Review"}</div>
                        </div>
                    }
                    value={timeLog.is_approved}
                    placement="bottom-start"
                    disabled={timeLog.created_by === currentUser?.id || timeLog.is_approved}
                    customButtonClassName="w-full h-11"
                    onChange={async (value: boolean) => {
                        if (timeLog.is_approved === value) return
                        try {
                            await updateTimeLog(workspaceSlug.toString(), timeLog.project, timeLog.id, {
                                is_approved: value,
                            })
                        } catch {
                            toast.error("Please try again later")
                        }
                    }}
                    className="grow"
                >
                    <CustomSelect.Option value={true}>
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="size-4 text-custom-primary-100" />
                            <div>Approved</div>
                        </div>
                    </CustomSelect.Option>
                    <CustomSelect.Option value={false}>
                        <div className="flex items-center gap-2">
                            <CircleDotDashed className="size-4 text-amber-700" />
                            <div>In Review</div>
                        </div>
                    </CustomSelect.Option>
                </CustomSelect>
            </div>
        </td>
    )
}
