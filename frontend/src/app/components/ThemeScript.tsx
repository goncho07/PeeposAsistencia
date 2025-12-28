export function ThemeScript() {
    const themeScript = `
    (function() {
      const theme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    })()
  `;

    return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}