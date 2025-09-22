
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");

    if (!target) {
        return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    try {
        const { data } = await axios.get(target, { timeout: 5000 });

        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : null;

        const descMatch = data.match(/<meta.*?name=["']description["'].*?content=["'](.*?)["']/);
        const subtitle = descMatch ? descMatch[1] : null;

        const imageMatch = data.match(/<meta.*?property=["']og:image["'].*?content=["'](.*?)["']/);
        const image = imageMatch ? imageMatch[1] : null;

        const domain = new URL(target).hostname;

        return NextResponse.json({ title, subtitle, image, url: target, domain });
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
