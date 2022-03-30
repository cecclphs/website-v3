import sharp from 'sharp'

export async function SavePNG(filepath, filename){
    await sharp(filepath)
        .png()
        .toFile(`/tmp/${filename}.png`)
}

export async function SaveFixedSizePNG(filepath, filename, width, height){
    await sharp(filepath)
        .resize(width, height)
        .png()
        .toFile(`/tmp/${filename}.png`)
}

export async function CreateThumbnail(filepath, filename, prefix="thumb-"){
    await sharp(filepath)
        .resize(48, 48)
        .png()
        .toFile(`/tmp/${prefix}${filename}.png`)
}
