import format from 'date-fns/format';
import styles from './styles.module.scss';

export function Header() {
	const currentDate = format(new Date(), 'EEEEEE, d, MM');

	return (
		<header className={styles.headerContainer}>
			<img src='/logo.svg' alt='logo' />
			<p>The best podcast website for you. Always.</p>
			<span>{currentDate}</span>
		</header>
	);
}
