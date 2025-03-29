1) I want to have a file uploader where i can drag and drop an image and just like in my /Users/eugeneleychenko/Downloads/Marine Demo/server/app.py file, we will extract the filename from the image. I want to use this library for the drag and drop part - /Users/eugeneleychenko/Downloads/Marine Demo/server/app.py.
2) also create a checkout cart component from the code below. I want to be able to have a checkout drawer that would have this look.


import { InteractiveCheckout, Product } from "@/components/ui/interactive-checkout"

import { Button } from "@/components/ui/button"

const defaultProducts: Product[] = [
    {
        id: "1",
        name: "Air Max 90",
        price: 129.99,
        category: "Running",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "Black/White",
    },
    {
        id: "2",
        name: "Ultra Boost",
        price: 179.99,
        category: "Performance",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "Grey/Blue",
    },
    {
        id: "3",
        name: "Classic Trainer",
        price: 89.99,
        category: "Casual",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "White/Red",
    },
];


function InteractiveCheckoutDemo() {
    return <InteractiveCheckout products={defaultProducts} />
}

export { InteractiveCheckoutDemo }

import { InteractiveCheckout, Product } from "@/components/ui/interactive-checkout"

import { Button } from "@/components/ui/button"

const defaultProducts: Product[] = [
    {
        id: "1",
        name: "Air Max 90",
        price: 129.99,
        category: "Running",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "Black/White",
    },
    {
        id: "2",
        name: "Ultra Boost",
        price: 179.99,
        category: "Performance",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "Grey/Blue",
    },
    {
        id: "3",
        name: "Classic Trainer",
        price: 89.99,
        category: "Casual",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "White/Red",
    },
];


function InteractiveCheckoutDemo() {
    return <InteractiveCheckout products={defaultProducts} />
}

export { InteractiveCheckoutDemo }

import { InteractiveCheckout, Product } from "@/components/ui/interactive-checkout"

import { Button } from "@/components/ui/button"

const defaultProducts: Product[] = [
    {
        id: "1",
        name: "Air Max 90",
        price: 129.99,
        category: "Running",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "Black/White",
    },
    {
        id: "2",
        name: "Ultra Boost",
        price: 179.99,
        category: "Performance",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "Grey/Blue",
    },
    {
        id: "3",
        name: "Classic Trainer",
        price: 89.99,
        category: "Casual",
        image: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/shoes-d2GWFGnVlkkUneRD3x2xDbUVHO1qMp",
        color: "White/Red",
    },
];


function InteractiveCheckoutDemo() {
    return <InteractiveCheckout products={defaultProducts} />
}

export { InteractiveCheckoutDemo }