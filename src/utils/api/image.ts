import sharp from 'sharp'

export function ToPNG(filepath){
    return sharp(filepath)
        .png()
        .toBuffer()
}

export function ToFixedSizePNG(filepath, width, height){
    return sharp(filepath)
        .resize(width, height)
        .png()
        .toBuffer()
}

export function CreateThumbnail(filepath, prefix="thumb-"){
    return sharp(filepath)
        .resize(48, 48)
        .png()
        .toBuffer()
}
