import { CONFIG } from '../config.js';

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <span>Color Coordinator — free &amp; open color theme tool.</span>
        <span>Made with {'\u2764'} by <a href={CONFIG.githubUrl} rel="noopener">Vitouch</a></span>
      </div>
    </footer>
  );
}
