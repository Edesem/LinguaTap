// types.ts

export interface Chapter {
    title: string;
    content: string;
}

export interface Book {
    title: string;
    author: string;
    content: Chapter[];
}