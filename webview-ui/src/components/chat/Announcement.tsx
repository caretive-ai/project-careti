import { memo } from "react"
import { CaretAnnouncement } from "@/caret/components/CaretAnnouncement"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Announcement = (props: any) => {
	return <CaretAnnouncement {...props} />
}

export default memo(Announcement)
