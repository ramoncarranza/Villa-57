import {NextRequest,NextResponse} from 'next/server';import {tmdb} from '../../lib';
export async function GET(req:NextRequest){const query=(req.nextUrl.searchParams.get('q')||'').trim().slice(0,120);if(!query)return NextResponse.json({results:[]});return NextResponse.json(await tmdb('/search/movie',{query,include_adult:'false',page:'1'}));}
