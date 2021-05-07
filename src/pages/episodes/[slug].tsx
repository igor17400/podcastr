import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { api } from '../../services/api';
import Image from 'next/image';
import Head from 'next/head';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';

type Episode = {
	id: string;
	title: string;
	thumbnail: string;
	members: string;
	description: string;
	duration: number;
	durationAsString: string;
	publishedAt: string;
	url: string;
};

type EpisodeProps = {
	episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
	const { play } = usePlayer();

	return (
		<div className={styles.episode}>
			<Head>
				<title>{episode.title} | Podcster</title>
			</Head>

			<div className={styles.thumbnailContainer}>
				<Link href='/'>
					<button type='button'>
						<img src='/arrow-left.svg' alt='back' />
					</button>
				</Link>
				<Image
					width={700}
					height={160}
					src={episode.thumbnail}
					objectFit='cover'
				/>
				<button type='button' onClick={() => play(episode)}>
					<img src='/play.svg' alt='play episode' />
				</button>
			</div>

			<header>
				<h1>{episode.title}</h1>
				<span>{episode.members}</span>
				<span>{episode.publishedAt}</span>
				<span>{episode.durationAsString}</span>
			</header>

			<div
				className={styles.description}
				dangerouslySetInnerHTML={{ __html: episode.description }}
			/>
		</div>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 2,
			_sort: 'published_at',
			_order: 'desc',
		},
	});

	const paths = data.map((episode) => {
		return {
			params: {
				slug: episode.id,
			},
		};
	});

	return {
		paths,
		fallback: 'blocking', // Best options for SEO
	};
};

export const getStaticProps: GetStaticProps = async (ctx) => {
	const { slug } = ctx.params; //Becareful the name SLUG exactly the same of the file's name [slug].tsx
	const { data } = await api.get(`/episodes/${slug}`);

	const episode = {
		id: data.id,
		title: data.title,
		thumbnail: data.thumbnail,
		members: data.members,
		publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
			locale: ptBR,
		}),
		duration: Number(data.file.duration),
		durationAsString: convertDurationToTimeString(Number(data.file.duration)),
		description: data.description,
		url: data.file.url,
	};

	return {
		props: {
			episode,
		},
		revalidate: 60 * 60 * 24, // 24 hours to reload page
	};
};