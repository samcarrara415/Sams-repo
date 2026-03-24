// ScreenCaptureKit display-region capture for iOS Simulator.
// Captures the screen area where the Simulator is at 30fps.
// Outputs length-prefixed JPEG frames to stdout.
// Uses display capture (not window capture) to ensure constant frame updates.

import Cocoa
import ScreenCaptureKit
import CoreMedia
import CoreVideo
import CoreImage

let TARGET_W = 340
let TARGET_H = 738
let FPS = 30

class AppDelegate: NSObject, NSApplicationDelegate {
    let handler = StreamHandler()
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        Task {
            do { try await startCapture() }
            catch {
                FileHandle.standardError.write("ERROR: \(error.localizedDescription)\n".data(using: .utf8)!)
                exit(1)
            }
        }
    }

    func startCapture() async throws {
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)

        // Find Simulator window to get its bounds
        guard let simWindow = content.windows.first(where: { w in
            (w.owningApplication?.applicationName ?? "").contains("Simulator")
            && w.frame.height > 100 && w.frame.width > 100
        }) else {
            FileHandle.standardError.write("ERROR: No Simulator window\n".data(using: .utf8)!)
            exit(1)
        }

        // Get the display the Simulator is on
        guard let display = content.displays.first else {
            FileHandle.standardError.write("ERROR: No display\n".data(using: .utf8)!)
            exit(1)
        }

        let frame = simWindow.frame
        FileHandle.standardError.write("Sim at: \(Int(frame.origin.x)),\(Int(frame.origin.y)) \(Int(frame.width))x\(Int(frame.height))\n".data(using: .utf8)!)

        // Capture the DISPLAY but cropped to the Simulator area
        let config = SCStreamConfiguration()
        config.width = TARGET_W
        config.height = TARGET_H

        // Set source rect to the Simulator window's position on screen
        // Note: SCK uses bottom-left origin, but frame is already in screen coords
        config.sourceRect = CGRect(
            x: frame.origin.x,
            y: CGFloat(display.height) - frame.origin.y - frame.height,
            width: frame.width,
            height: frame.height
        )

        config.minimumFrameInterval = CMTime(value: 1, timescale: CMTimeScale(FPS))
        config.pixelFormat = kCVPixelFormatType_32BGRA
        config.queueDepth = 5
        config.showsCursor = false

        // Use display capture with all windows excluded EXCEPT Simulator
        // This way we only see the Simulator content
        let appsToExclude = content.applications.filter {
            !$0.applicationName.contains("Simulator")
        }
        let filter = SCContentFilter(display: display,
                                      excludingApplications: appsToExclude,
                                      exceptingWindows: [simWindow])

        let stream = SCStream(filter: filter, configuration: config, delegate: nil)
        try stream.addStreamOutput(handler, type: SCStreamOutputType.screen, sampleHandlerQueue: DispatchQueue(label: "cap", qos: .userInteractive))
        try await stream.startCapture()

        FileHandle.standardError.write("READY\n".data(using: .utf8)!)
    }
}

class StreamHandler: NSObject, SCStreamOutput {
    let fd = FileHandle.standardOutput.fileDescriptor
    let ciContext = CIContext(options: [.useSoftwareRenderer: false])
    var frameCount = 0

    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .screen, let pixelBuffer = sampleBuffer.imageBuffer else { return }

        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
        guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
              let jpegData = ciContext.jpegRepresentation(
                  of: ciImage, colorSpace: colorSpace,
                  options: [kCGImageDestinationLossyCompressionQuality as CIImageRepresentationOption: 0.45]
              ) else { return }

        // Write length-prefixed JPEG
        var len = UInt32(jpegData.count).bigEndian
        let header = Data(bytes: &len, count: 4)

        header.withUnsafeBytes { _ = write(fd, $0.baseAddress!, 4) }
        jpegData.withUnsafeBytes { ptr in
            var remaining = jpegData.count
            var offset = 0
            while remaining > 0 {
                let written = write(fd, ptr.baseAddress!.advanced(by: offset), remaining)
                if written <= 0 { exit(0) }
                offset += written
                remaining -= written
            }
        }

        frameCount += 1
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
