import jwt from 'jsonwebtoken'

const authDoctor = async (req, res, next) => {
    try {
        const token = req.headers.dtoken
        if (!token) return res.json({ success: false, message: "Not authorized" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Attach docId for later use
        req.docId = decoded.id

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Invalid or expired token" })
    }
}

export default authDoctor
