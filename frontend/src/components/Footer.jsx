export default function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-5">
      <div className="container text-center small">
        © {new Date().getFullYear()} CampusConnect – A student-to-student marketplace for college communities
      </div>
    </footer>
  );
}
