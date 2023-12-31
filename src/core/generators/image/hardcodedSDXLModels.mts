import { SDXLModel } from "../../types/structures.mts"


export const aiClipFactoryModels: SDXLModel[] = [
    // TODO: add my own sdxl-panorama model
    // but it uses textual inversion, so needs some work
    {
    "image": "",
    "title": "360Redmond",
    "repo": "artificialguybr/360Redmond",
    "trigger_word": "360 view",
    "weights": "View360.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
    },
    {
    "image": "https://jbilcke-hf-ai-clip-factory.hf.space/images/models/sdxl-starfield.jpg",
    "title": "sdxl-starfield",
    "repo": "jbilcke-hf/sdxl-starfield",
    "trigger_word": "starfield-style",
    "weights": "pytorch_lora_weights.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
  },
  {
    "image": "https://jbilcke-hf-ai-clip-factory.hf.space/images/models/sdxl-akira.jpg",
    "title": "sdxl-akira",
    "repo": "jbilcke-hf/sdxl-akira",
    "trigger_word": "akira-style",
    "weights": "pytorch_lora_weights.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
  },
  {
    "image": "https://jbilcke-hf-ai-clip-factory.hf.space/images/models/sdxl-cyberpunk-2077.jpg",
    "title": "sdxl-cyberpunk-2077",
    "repo": "jbilcke-hf/sdxl-cyberpunk-2077",
    "trigger_word": "cyberpunk-2077",
    "weights": "pytorch_lora_weights.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
  },
  {
    "image": "https://jbilcke-hf-ai-clip-factory.hf.space/images/models/sdxl-modern-pixar.jpg",
    "title": "sdxl-pixar-2",
    "repo": "jbilcke-hf/sdxl-pixar-2",
    "trigger_word": "pixar-2",
    "weights": "pytorch_lora_weights.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
  },
  {
    "image": "https://jbilcke-hf-ai-clip-factory.hf.space/images/models/sdxl-cinematic-2.jpg",
    "title": "sdxl-cinematic-2",
    "repo": "jbilcke-hf/sdxl-cinematic-2",
    "trigger_word": "cinematic-2",
    "weights": "pytorch_lora_weights.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
  },
  {
    "image": "https://jbilcke-hf-ai-clip-factory.hf.space/images/models/sdxl-moebius-lean.jpg",
    "title": "sdxl-moebius-lean",
    "repo": "jbilcke-hf/sdxl-moebius-lean",
    "trigger_word": "moebius-lean",
    "weights": "pytorch_lora_weights.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
  },
  {
    "image": "https://jbilcke-hf-ai-clip-factory.hf.space/images/models/sdxl-foundation-2.jpg",
    "title": "sdxl-foundation-2",
    "repo": "jbilcke-hf/sdxl-foundation-2",
    "trigger_word": "hober-mallow",
    "weights": "pytorch_lora_weights.safetensors",
    "is_compatible": true,
    "likes": 0,
    "downloads": 0
  },
]

export const loraTheExplorerModels: SDXLModel[] = [
  {
      "image": "",
      "title": "Mickey-1928",
      "repo": "Pclanglais/Mickey-1928",
      "trigger_word": "Mickey",
      "weights": "pytorch_lora_weights.safetensors",
      "is_compatible": true,
      "likes": 0,
      "downloads": 0
  },
  {
      "image": "images/pixel-art-xl.jpeg",
      "title": "Pixel Art XL",
      "repo": "nerijs/pixel-art-xl",
      "trigger_word": "pixel art",
      "weights": "pixel-art-xl.safetensors",
      "is_compatible": true,
      "likes": 134,
      "downloads": 17058
  },
  {
      "image": "images/riding-min.jpg",
      "title": "Tintin AI",
      "repo": "Pclanglais/TintinIA",
      "trigger_word": "drawing of tintin",
      "weights": "pytorch_lora_weights.safetensors",
      "is_compatible": true,
      "is_nc": true,
      "likes": 11,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/ProomptEngineer/pe-balloon-diffusion-style/resolve/main/2095176.jpeg",
      "title": "PE Balloon Diffusion",
      "repo": "ProomptEngineer/pe-balloon-diffusion-style",
      "trigger_word": "PEBalloonStyle",
      "weights": "PE_BalloonStyle.safetensors",
      "is_compatible": true,
      "likes": 2,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/joachimsallstrom/aether-cloud-lora-for-sdxl/resolve/main/2378710.jpeg",
      "title": "Aether Cloud",
      "repo": "joachimsallstrom/aether-cloud-lora-for-sdxl",
      "trigger_word": "a cloud that looks like a",
      "weights": "Aether_Cloud_v1.safetensors",
      "is_compatible": true,
      "likes": 2,
      "downloads": 0
  },
  {
      "image": "images/crayon.png",
      "title": "Crayon Style",
      "repo": "ostris/crayon_style_lora_sdxl",
      "trigger_word": "",
      "weights": "crayons_v1_sdxl.safetensors",
      "is_compatible": true,
      "likes": 12,
      "downloads": 0
  },
  {
      "image": "https://tjzk.replicate.delivery/models_models_cover_image/c8b21524-342a-4dd2-bb01-3e65349ed982/image_12.jpeg",
      "title": "Zelda 64 SDXL",
      "repo": "jbilcke-hf/sdxl-zelda64",
      "trigger_word": "in the style of <s0><s1>",
      "weights": "lora.safetensors",
      "text_embedding_weights": "embeddings.pti",
      "is_compatible": false,
      "is_pivotal": true,
      "likes": 3,
      "downloads": 0
  },
  {
      "image": "images/papercut_SDXL.jpeg",
      "title": "Papercut SDXL",
      "repo": "TheLastBen/Papercut_SDXL",
      "trigger_word": "papercut",
      "weights": "papercut.safetensors",
      "is_compatible": true,
      "likes": 21,
      "downloads": 0
  },
  {
      "image": "https://pbxt.replicate.delivery/8LKCty2D5b5BBBjylErfI8Xqf4OTSsnA0TIJccnpPct3GmeiA/out-0.png",
      "title": "2004 bad digital photography",
      "repo": "fofr/sdxl-2004",
      "trigger_word": "2004, in the style of <s0><s1>",
      "weights": "lora.safetensors",
      "text_embedding_weights": "embeddings.pti",
      "is_compatible": false,
      "is_pivotal": true,
      "likes": 3,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/joachimsallstrom/aether-ghost-lora-for-sdxl/resolve/14de4e59a3f44dabc762855da208cb8f44a7ac78/ghost.png",
      "title": "Aether Ghost",
      "repo": "joachimsallstrom/aether-ghost-lora-for-sdxl",
      "trigger_word": "transparent ghost",
      "weights": "Aether_Ghost_v1.1_LoRA.safetensors",
      "is_compatible": true,
      "likes": 5,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/artificialguybr/ColoringBookRedmond-V2/resolve/main/00493-1759595235.png",
      "title": "ColoringBook.Redmond V2",
      "repo": "artificialguybr/ColoringBookRedmond-V2",
      "trigger_word": "ColoringBookAF",
      "weights": "ColoringBookRedmond-ColoringBook-ColoringBookAF.safetensors",
      "is_compatible": true,
      "likes": 2,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/Norod78/SDXL-LofiGirl-Lora/resolve/main/SDXL-LofiGirl-Lora/Examples/_00044-20230829080050-45-the%20%20girl%20with%20a%20pearl%20earring%20the%20LofiGirl%20%20_lora_SDXL-LofiGirl-Lora_1_%2C%20Very%20detailed%2C%20clean%2C%20high%20quality%2C%20sharp%20image.jpg",
      "title": "LoFi Girl SDXL",
      "repo": "Norod78/SDXL-LofiGirl-Lora",
      "trigger_word": "LofiGirl",
      "weights": "SDXL-LofiGirl-Lora.safetensors",
      "is_compatible": true,
      "likes": 3,
      "downloads": 0
  },
  {
      "image": "images/embroid.png",
      "title": "Embroidery Style",
      "repo": "ostris/embroidery_style_lora_sdxl",
      "trigger_word": "",
      "weights": "embroidered_style_v1_sdxl.safetensors",
      "is_compatible": true,
      "likes": 1,
      "downloads": 0
  },
  {
      "image": "images/3d_style_4.jpeg",
      "title": "3D Render Style",
      "repo": "goofyai/3d_render_style_xl",
      "trigger_word": "3d style",
      "weights": "3d_render_style_xl.safetensors",
      "is_compatible": true,
      "likes": 39,
      "downloads": 0
  },
  {
      "image": "images/watercolor.png",
      "title": "Watercolor Style",
      "repo": "ostris/watercolor_style_lora_sdxl",
      "trigger_word": "",
      "weights": "watercolor_v1_sdxl.safetensors",
      "is_compatible": true,
      "likes": 6,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/veryVANYA/ps1-graphics-sdxl/resolve/main/2070471.jpeg",
      "title": "PS1 Graphics v2 SDXL",
      "repo": "veryVANYA/ps1-graphics-sdxl-v2",
      "trigger_word": "ps1 style",
      "weights": "ps1_style_SDXL_v2.safetensors",
      "is_compatible": true,
      "likes": 3,
      "downloads": 0
  },
  {
      "image": "images/william_eggleston.webp",
      "title": "William Eggleston Style",
      "repo": "TheLastBen/William_Eggleston_Style_SDXL",
      "trigger_word": "by william eggleston",
      "weights": "wegg.safetensors",
      "is_compatible": true,
      "likes": 7,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/davizca87/c-a-g-coinmaker/resolve/main/1722160.jpeg",
      "title": "CAG Coinmaker",
      "repo": "davizca87/c-a-g-coinmaker",
      "trigger_word": "c01n",
      "weights": "c01n-000010.safetensors",
      "is_compatible": true,
      "likes": 1,
      "downloads": 0
  },
  {
      "image": "images/dog.png",
      "title": "Cyborg Style",
      "repo": "goofyai/cyborg_style_xl",
      "trigger_word": "cyborg style",
      "weights": "cyborg_style_xl-off.safetensors",
      "is_compatible": true,
      "likes": 6,
      "downloads": 0
  },
  {
      "image": "images/ToyRedmond-ToyLoraForSDXL10.png",
      "title": "Toy.Redmond",
      "repo": "artificialguybr/ToyRedmond-ToyLoraForSDXL10",
      "trigger_word": "FnkRedmAF",
      "weights": "ToyRedmond-FnkRedmAF.safetensors",
      "is_compatible": true,
      "likes": 3,
      "downloads": 0
  },
  {
      "image": "images/voxel-xl-lora.png",
      "title": "Voxel XL",
      "repo": "Fictiverse/Voxel_XL_Lora",
      "trigger_word": "voxel style",
      "weights": "VoxelXL_v1.safetensors",
      "is_compatible": true,
      "likes": 12,
      "downloads": 0
  },
  {
      "image": "images/uglysonic.webp",
      "title": "Ugly Sonic",
      "repo": "minimaxir/sdxl-ugly-sonic-lora",
      "trigger_word": "sonic the hedgehog",
      "weights": "pytorch_lora_weights.bin",
      "is_compatible": true,
      "likes": 3,
      "downloads": 1480
  },
  {
      "image": "images/corgi_brick.jpeg",
      "title": "Lego BrickHeadz",
      "repo": "nerijs/lego-brickheadz-xl",
      "trigger_word": "lego brickheadz",
      "weights": "legobrickheadz-v1.0-000004.safetensors",
      "is_compatible": true,
      "likes": 13,
      "downloads": 0
  },
  {
      "image": "images/lego-minifig-xl.jpeg",
      "title": "Lego Minifig XL",
      "repo": "nerijs/lego-minifig-xl",
      "trigger_word": "lego minifig",
      "weights": "legominifig-v1.0-000003.safetensors",
      "is_compatible": true,
      "likes": 14,
      "downloads": 0
  },
  {
      "image": "images/jojoso1.jpg",
      "title": "JoJo's Bizarre style",
      "repo": "Norod78/SDXL-jojoso_style-Lora",
      "trigger_word": "jojoso style",
      "weights": "SDXL-jojoso_style-Lora-r8.safetensors",
      "is_compatible": true,
      "likes": 2,
      "downloads": 0
  },
  {
      "image": "images/pikachu.webp",
      "title": "Pikachu XL",
      "repo": "TheLastBen/Pikachu_SDXL",
      "trigger_word": "pikachu",
      "weights": "pikachu.safetensors",
      "is_compatible": true,
      "likes": 1,
      "downloads": 0
  },
  {
      "image": "images/LogoRedmond-LogoLoraForSDXL.jpeg",
      "title": "Logo.Redmond",
      "repo": "artificialguybr/LogoRedmond-LogoLoraForSDXL",
      "trigger_word": "LogoRedAF",
      "weights": "LogoRedmond_LogoRedAF.safetensors",
      "is_compatible": true,
      "likes": 18,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/Norod78/SDXL-StickerSheet-Lora/resolve/main/Examples/00073-20230831113700-7780-Cthulhu%20StickerSheet%20%20_lora_SDXL-StickerSheet-Lora_1_%2C%20based%20on%20H.P%20Lovecraft%20stories%2C%20Very%20detailed%2C%20clean%2C%20high%20quality%2C%20sharp.jpg",
      "title": "Sticker Sheet",
      "repo": "Norod78/SDXL-StickerSheet-Lora",
      "trigger_word": "StickerSheet",
      "weights": "SDXL-StickerSheet-Lora.safetensors",
      "is_compatible": true,
      "likes": 12,
      "downloads": 0
  },
  {
      "image": "images/LineAni.Redmond.png",
      "title": "LinearManga.Redmond",
      "repo": "artificialguybr/LineAniRedmond-LinearMangaSDXL",
      "trigger_word": "LineAniAF",
      "weights": "LineAniRedmond-LineAniAF.safetensors",
      "is_compatible": true,
      "likes": 3,
      "downloads": 0
  },
  {
      "image": "images/josef_koudelka.webp",
      "title": "Josef Koudelka Style",
      "repo": "TheLastBen/Josef_Koudelka_Style_SDXL",
      "trigger_word": "by josef koudelka",
      "weights": "koud.safetensors",
      "is_compatible": true,
      "likes": 4,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/goofyai/Leonardo_Ai_Style_Illustration/resolve/main/leo-2.png",
      "title": "Leonardo Style",
      "repo": "goofyai/Leonardo_Ai_Style_Illustration",
      "trigger_word": "leonardo style",
      "weights": "leonardo_illustration.safetensors",
      "is_compatible": true,
      "likes": 4,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/Norod78/SDXL-simpstyle-Lora/resolve/main/Examples/00006-20230820150225-558-the%20girl%20with%20a%20pearl%20earring%20by%20johannes%20vermeer%20simpstyle%20_lora_SDXL-simpstyle-Lora_1_%2C%20Very%20detailed%2C%20clean%2C%20high%20quality%2C%20sh.jpg",
      "title": "SimpStyle",
      "repo": "Norod78/SDXL-simpstyle-Lora",
      "trigger_word": "simpstyle",
      "weights": "SDXL-simpstyle-Lora-r8.safetensors",
      "is_compatible": true,
      "likes": 6,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/artificialguybr/StoryBookRedmond/resolve/main/00162-1569823442.png",
      "title": "Storybook.Redmond",
      "repo": "artificialguybr/StoryBookRedmond",
      "trigger_word": "KidsRedmAF",
      "weights": "StoryBookRedmond-KidsRedmAF.safetensors",
      "is_compatible": true,
      "likes": 2,
      "downloads": 0
  },
  {
      "image": "https://huggingface.co/chillpixel/blacklight-makeup-sdxl-lora/resolve/main/preview.png",
      "title": "Blacklight Makeup",
      "repo": "chillpixel/blacklight-makeup-sdxl-lora",
      "trigger_word": "with blacklight makeup",
      "weights": "pytorch_lora_weights.bin",
      "is_compatible": true,
      "likes": 3,
      "downloads": 508
  },
  {
      "repo": "ProomptEngineer/pe-neon-sign-style",
      "title": "pe-neon-sign-style",
      "trigger_word": "PENeonSign",
      "is_compatible": true,
      "image": "https://huggingface.co/ProomptEngineer/pe-neon-sign-style/resolve/main/2266230.jpeg",
      "weights": "PE_NeonSignStyle.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "ProomptEngineer/pe-lofi-hiphop-lofi-girl-concept",
      "title": "pe-lofi-hiphop-lofi-girl-concept",
      "trigger_word": "PELofiHipHop",
      "is_compatible": true,
      "image": "https://huggingface.co/ProomptEngineer/pe-lofi-hiphop-lofi-girl-concept/resolve/main/1967528.jpeg",
      "weights": "PE_LofiHipHop.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "ProomptEngineer/pe-shitty-fanart",
      "title": "pe-shitty-fanart",
      "trigger_word": "PETerribleFanArt",
      "is_compatible": true,
      "image": "https://huggingface.co/ProomptEngineer/pe-shitty-fanart/resolve/main/2028517.jpeg",
      "weights": "PE_TerribleFanArtV1.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "ProomptEngineer/pe-sandsculpter-style",
      "title": "pe-sandsculpter-style",
      "trigger_word": "PESandSculpture",
      "is_compatible": true,
      "image": "https://huggingface.co/ProomptEngineer/pe-sandsculpter-style/resolve/main/2234364.jpeg",
      "weights": "PE_SandSculpture.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "ProomptEngineer/pe-shitty-medieval-paintings",
      "title": "pe-shitty-medieval-paintings",
      "trigger_word": "PEBadMedivalArt",
      "is_compatible": true,
      "image": "https://huggingface.co/ProomptEngineer/pe-shitty-medieval-paintings/resolve/main/2061695.jpeg",
      "weights": "PE_BadMedivalArt.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "ProomptEngineer/pe-courtroomsketch-style",
      "title": "pe-courtroomsketch-style",
      "trigger_word": "PECourtRoomSketch",
      "is_compatible": true,
      "image": "https://huggingface.co/ProomptEngineer/pe-courtroomsketch-style/resolve/main/2201914.jpeg",
      "weights": "PE_CourtRoomSketchV2.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "ProomptEngineer/pe-funko-pop-diffusion-style",
      "title": "pe-funko-pop-diffusion-style",
      "trigger_word": "PEPopFigure",
      "is_compatible": true,
      "image": "https://huggingface.co/ProomptEngineer/pe-funko-pop-diffusion-style/resolve/main/2219678.jpeg",
      "weights": "PE_FunkoPopStyle.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "lordjia/lelo-lego-lora",
      "title": "lelo-lego-lora",
      "trigger_word": "LEGO BrickHeadz",
      "is_compatible": true,
      "image": "https://huggingface.co/lordjia/lelo-lego-lora/resolve/main/2403933.jpeg",
      "weights": "lego_v2.0_XL_32.safetensors",
      "likes": 4,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/dressed-animals",
      "title": "dressed-animals",
      "trigger_word": "Dressed animals page",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/dressed-animals/resolve/main/2322079.jpeg",
      "weights": "Dressed animals.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/vintage-postage-stamps",
      "title": "vintage-postage-stamps",
      "trigger_word": "Vintage Postage Stamps",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/vintage-postage-stamps/resolve/main/2332736.jpeg",
      "weights": "Vintage Postage Stamps.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/video-installation",
      "title": "video-installation",
      "trigger_word": "Video installation",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/video-installation/resolve/main/2332706.jpeg",
      "weights": "Video installation.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/ukiyo-e-art",
      "title": "ukiyo-e-art",
      "trigger_word": "Ukiyo-e Art",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/ukiyo-e-art/resolve/main/2332646.jpeg",
      "weights": "Ukiyo-e Art.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/surreal-collage",
      "title": "surreal-collage",
      "trigger_word": "Surreal Collage",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/surreal-collage/resolve/main/2331965.jpeg",
      "weights": "Surreal Collage.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/stop-motion-animation",
      "title": "stop-motion-animation",
      "trigger_word": "Stop-Motion Animation",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/stop-motion-animation/resolve/main/2331934.jpeg",
      "weights": "Stop-Motion Animation.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/studio-ghibli-style",
      "title": "studio-ghibli-style",
      "trigger_word": "Studio Ghibli Style",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/studio-ghibli-style/resolve/main/2331948.jpeg",
      "weights": "Studio Ghibli Style.safetensors",
      "likes": 2,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/punk-collage",
      "title": "punk-collage",
      "trigger_word": "Punk Collage",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/punk-collage/resolve/main/2330616.jpeg",
      "weights": "Punk Collage.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/needlepoint",
      "title": "needlepoint",
      "trigger_word": "Needlepoint page",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/needlepoint/resolve/main/2329532.jpeg",
      "weights": "Needlepoint.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/made-of-iridescent-foil",
      "title": "made-of-iridescent-foil",
      "trigger_word": "Made Of Iridescent Foil page",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/made-of-iridescent-foil/resolve/main/2325476.jpeg",
      "weights": "Made Of Iridescent Foil.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/lascaux",
      "title": "lascaux",
      "trigger_word": "Lascaux page",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/lascaux/resolve/main/2325538.jpeg",
      "weights": "Lascaux.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/color-palette",
      "title": "color-palette",
      "trigger_word": "Color Palette -",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/color-palette/resolve/main/2248053.jpeg",
      "weights": "Color Palette.safetensors",
      "likes": 2,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/albumen-print",
      "title": "albumen-print",
      "trigger_word": "Albumen Print page",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/albumen-print/resolve/main/2320833.jpeg",
      "weights": "Albumen Print.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "KappaNeuro/1987-action-figure-playset-packaging",
      "title": "1987-action-figure-playset-packaging",
      "trigger_word": "1987 Action Figure Playset Packaging page",
      "is_compatible": true,
      "image": "https://huggingface.co/KappaNeuro/1987-action-figure-playset-packaging/resolve/main/2320798.jpeg",
      "weights": "1987 Action Figure Playset Packaging.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "Norod78/SDXL-VintageMagStyle-Lora",
      "title": "SDXL-VintageMagStyle-Lora",
      "trigger_word": "VintageMagStyle",
      "is_compatible": true,
      "image": "https://huggingface.co/Norod78/SDXL-VintageMagStyle-Lora/resolve/main/Examples/00015-20230906102032-7778-Wonderwoman%20VintageMagStyle%20%20%20_lora_SDXL-VintageMagStyle-Lora_1_,%20Very%20detailed,%20clean,%20high%20quality,%20sharp%20image.jpg",
      "weights": "SDXL-VintageMagStyle-Lora.safetensors",
      "likes": 7,
      "downloads": 0
  },
  {
      "repo": "CiroN2022/road-sign",
      "title": "road-sign",
      "trigger_word": "road sign",
      "is_compatible": true,
      "image": "https://huggingface.co/CiroN2022/road-sign/resolve/main/2338481.jpeg",
      "weights": "road_sign.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "CiroN2022/mosaic-style",
      "title": "mosaic-style",
      "trigger_word": "mosaic",
      "is_compatible": true,
      "image": "https://huggingface.co/CiroN2022/mosaic-style/resolve/main/2216189.jpeg",
      "weights": "mosaic.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "CiroN2022/cd-md-music",
      "title": "cd-md-music",
      "trigger_word": "product photo cd",
      "is_compatible": true,
      "image": "https://huggingface.co/CiroN2022/cd-md-music/resolve/main/2183289.jpeg",
      "weights": "cd_music.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "CiroN2022/hair-style",
      "title": "hair-style",
      "trigger_word": "crazy alternate hairstyle",
      "is_compatible": true,
      "image": "https://huggingface.co/CiroN2022/hair-style/resolve/main/2193812.jpeg",
      "weights": "hair_style.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "CiroN2022/overprint-effect",
      "title": "overprint-effect",
      "trigger_word": "overprint_effect",
      "is_compatible": true,
      "image": "https://huggingface.co/CiroN2022/overprint-effect/resolve/main/2139470.jpeg",
      "weights": "Overprint_effect_sdxl.safetensors",
      "likes": 1,
      "downloads": 0
  },
  {
      "repo": "CiroN2022/toy-face",
      "title": "toy-face",
      "trigger_word": "toy_face",
      "is_compatible": true,
      "image": "https://huggingface.co/CiroN2022/toy-face/resolve/main/2123367.jpeg",
      "weights": "toy_face_sdxl.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "CiroN2022/ascii-art",
      "title": "ascii-art",
      "trigger_word": "ascii_art",
      "is_compatible": true,
      "image": "https://huggingface.co/CiroN2022/ascii-art/resolve/main/2080723.jpeg",
      "weights": "ascii_art-sdxl.safetensors",
      "likes": 0,
      "downloads": 0
  },
  {
      "repo": "artificialguybr/PixelArtRedmond",
      "title": "PixelArtRedmond",
      "trigger_word": "Pixel Art, PixArFK",
      "likes": 1,
      "downloads": 0,
      "is_compatible": true,
      "image": "https://huggingface.co/artificialguybr/PixelArtRedmond/resolve/main/pixel-0017-714031916.png",
      "weights": "PixelArtRedmond-Lite64.safetensors"
  },
  {
      "repo": "artificialguybr/StickersRedmond",
      "title": "StickersRedmond",
      "trigger_word": "Stickers",
      "likes": 2,
      "downloads": 0,
      "is_compatible": true,
      "image": "https://huggingface.co/artificialguybr/StickersRedmond/resolve/main/00000-3383490575.png",
      "weights": "StickersRedmond.safetensors"
  },
  {
      "repo": "artificialguybr/ClayAnimationRedmond",
      "title": "ClayAnimationRedmond",
      "trigger_word": "Clay Animation",
      "likes": 5,
      "downloads": 0,
      "is_compatible": true,
      "image": "https://huggingface.co/artificialguybr/ClayAnimationRedmond/resolve/main/00138-3585231804.png",
      "weights": "ClayAnimationRedm.safetensors"
  },
  {
    "image":"https://replicate.delivery/pbxt/aVhJriYftYQCFCd81DrvNGktIcOlJrb3fifcOTQ3yI7LZWxiA/out-0.png",
    "repo": "fofr/sdxl-vision-pro",
    "title": "SDXL Vision Pro",
    "trigger_word": "<s0><s1> VR headset",
    "weights": "lora.safetensors",
    "text_embedding_weights": "embeddings.pti",
    "is_compatible": false,
    "is_pivotal": true,
    "likes": 1,
    "downloads": 0
  },
  {
    "image": "https://huggingface.co/joachimsallstrom/aether-glitch-lora-for-sdxl/resolve/main/2680627.jpeg",
    "repo": "joachimsallstrom/aether-glitch-lora-for-sdxl",
    "title": "Aether VHS Glitch",
    "trigger_word": "vhs glitch",
    "weights": "Aether_Glitch_v1_LoRA.safetensors",
    "is_compatible": true,
    "likes": 1
  },
  {
    "image": "https://huggingface.co/artificialguybr/TshirtDesignRedmond/resolve/main/00097-1339429505.png",
    "repo": "artificialguybr/TshirtDesignRedmond-V2",
    "title": "T-Shirt.Design.Redmond V2",
    "trigger_word": "TshirtDesignAF",
    "weights": "TShirtDesignRedmondV2-Tshirtdesign-TshirtDesignAF.safetensors",
    "is_compatible": true,
    "likes": 4
  },
  {
    "image": "https://huggingface.co/ostris/ikea-instructions-lora-sdxl/resolve/main/2709929.jpeg",
    "repo": "ostris/ikea-instructions-lora-sdxl",
    "title": "IKEA Instructions",
    "trigger_word": "",
    "weights": "ikea_instructions_xl_v1_5.safetensors",
    "is_compatible": true,
    "likes": 106
  },
  {
    "image": "https://huggingface.co/ostris/super-cereal-sdxl-lora/resolve/main/2879386.jpeg",
    "repo": "ostris/super-cereal-sdxl-lora",
    "title": "Super Cereal",
    "trigger_word": "",
    "weights": "cereal_box_sdxl_v1.safetensors",
    "is_compatible": true,
    "likes": 5
  },
  {
    "image": "https://replicate.delivery/pbxt/CoMBej9GOtyNKqyDHb0fsNSdABpTzOszpjltZGvHsbqif8XjA/out-0.png",
    "repo": "jakedahn/sdxl-isometric-geology",
    "title": "Isometric Geology",
    "trigger_word": "in the style of <s0><s1>",
    "weights": "lora.safetensors",
    "text_embedding_weights": "embeddings.pti",
    "is_compatible": false,
    "is_pivotal": true,
    "likes": 1
  },
  {
    "image": "https://huggingface.co/artificialguybr/analogredmond-v2/resolve/main/00279-913323466.png",
    "repo": "artificialguybr/analogredmond-v2",
    "title":"Analog Photography.Redmond",
    "trigger_word": "AnalogRedmAF",
    "weights": "AnalogRedmondV2-Analog-AnalogRedmAF.safetensors",
    "is_compatible": true,
    "likes": 3
  },
  {
    "image": "https://huggingface.co/stets/nintendo64_cartridge/resolve/main/00002-%5Bnumber%5D-840302403-_%20_lora_n64-000002_1_%20n64%20game%2C%20cartridge%2C%20titled%2C%20chicken%20riding%20a%20bicycle.png",
    "repo":"stets/nintendo64_cartridge",
    "title": "Nintendo 64 Cartridge",
    "weights": "n64-000001.safetensors",
    "trigger_word": "n64",
    "is_compatible": true,
    "likes": 6
  },
  {
    "image": "https://huggingface.co/joachimsallstrom/aether-bubbles-foam-lora-for-sdxl/resolve/main/3056728.jpeg",
    "repo": "joachimsallstrom/aether-bubbles-foam-lora-for-sdxl",
    "title": "Aether Bubbles & Foam",
    "weights": "Aether_Bubbles_And_Foam_v1_SDXL_LoRA.safetensors",
    "trigger_word": "made of bath foam and soap bubbles",
    "is_compatible": true,
    "likes": 2,
    "new": true
  },
  {
    "image": "https://huggingface.co/artificialguybr/3DRedmond-V1/resolve/main/images/00064-2498532539.png",
    "repo":"artificialguybr/3DRedmond-V1",
    "title": "3D.Redmond",
    "weights": "3DRedmond-3DRenderStyle-3DRenderAF.safetensors",
    "trigger_word": "3D Render Style, 3DRenderAF",
    "is_compatible": true,
    "likes": 5,
    "new": true
  },
  {
    "image": "https://i.imgur.com/cAx2FL1.jpg",
    "repo": "CiroN2022/tape-people",
    "title": "Covered in Tape",
    "weights": "Tape_people.safetensors",
    "trigger_word": "covered of tape, caution tape, keep out",
    "is_compatible": true,
    "likes": 2,
    "new": true
  }
  
]