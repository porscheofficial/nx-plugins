import FormData from "form-data"
import * as httpsRequest from "https"
import * as httpRequest from "http"
type RequestOptions = httpsRequest.RequestOptions | httpRequest.RequestOptions

export function request({
    successStatus,
    requestBody,
    errorMessagePrefix = "Request failed",
    ...requestOptions
}: {
    successStatus: number
    requestBody?: string | Buffer | FormData
    errorMessagePrefix?: string
    protocol: Required<RequestOptions["protocol"]>
} & RequestOptions) {
    const requester = requestOptions.protocol.startsWith("https") ? httpsRequest : httpRequest

    let bodyBuffer: Buffer = undefined
    if (requestBody) {
        if (requestBody instanceof FormData) {
            bodyBuffer = requestBody.getBuffer()
            requestOptions.headers = {
                "Content-Type": `multipart/form-data;boundary="${requestBody.getBoundary()}"`,
                // always allow override
                ...requestOptions.headers,
            }
        } else if (typeof requestBody === "string") {
            bodyBuffer = Buffer.from(requestBody)
        }

        if (Buffer.isBuffer(bodyBuffer)) {
            requestOptions.headers = {
                "Content-Length": bodyBuffer.byteLength,
                // always allow override
                ...requestOptions.headers,
            }
        } else {
            throw new Error(`Invalid requestBody type. Must be Buffer, FormData or string.`)
        }
    }

    return new Promise<string>((resolve, reject) => {
        const req = requester
            .request(requestOptions, (res) => {
                let data = ""
                res.on("data", (d) => {
                    data += d
                })
                res.on("error", (e) => {
                    // response error
                    reject(e)
                })
                res.on("end", () => {
                    if (res.statusCode === successStatus) {
                        resolve(data)
                    } else if (data.length > 0) {
                        try {
                            const { message } = JSON.parse(data)

                            return reject(`${errorMessagePrefix}: [${res.statusCode} - ${message}]`)
                        } catch (e) {
                            return reject(`${errorMessagePrefix}: [${res.statusCode}]`)
                        }
                    } else {
                        return reject(`${errorMessagePrefix}: [${res.statusCode}]`)
                    }
                })
            })
            .on("error", (e) => {
                // request error
                reject(e)
            })
        if (bodyBuffer) {
            req.write(bodyBuffer)
        }
        req.end()
    })
}

export function requestUrl(
    url: URL,
    requestArgs: Omit<Parameters<typeof request>[0], "host" | "port" | "path" | "protocol">
) {
    const { hostname, port, pathname, protocol, searchParams } = url

    const combinedPath = pathname + (searchParams ? `?${searchParams.toString()}` : "")

    return request({
        hostname,
        port,
        path: combinedPath,
        protocol,
        ...requestArgs,
    })
}
