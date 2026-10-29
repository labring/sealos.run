import '../[locale]/global.css';
export default function AttributionLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='zh'>
			<body>{children}</body>
		</html>
	);
}
