/**
 * CARET MODIFICATION: Re-export grpc-handler utilities from Cline
 * Extends with Caret-specific functionality if needed
 */
export type { StreamingResponseHandler } from "../../../src/core/controller/grpc-handler"

// TODO: Add Caret-specific grpc handlers if needed
// export class CaretStreamingResponseHandler extends StreamingResponseHandler {
//     // Caret-specific functionality
// }
