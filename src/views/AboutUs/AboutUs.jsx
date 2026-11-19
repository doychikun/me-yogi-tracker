import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="AboutUs">
      <div className="Team">Meet the creator</div>

      <div className="card-list">
        <div className="card">
          <img
            className="card-img-top"
            src={require("../../assets/images/team/Niki.jpg")}
            alt="Nikola Doychev"
            style={{ width: 348, height: 453.5 }}
          />
          <h2>Nikola Doychev</h2>
          <div className="card-links">
            <a href="https://github.com/doychikun" rel="noreferrer" target={"_blank"}>
              GitHub
            </a>
            <a href="https://gitlab.com/doychikun" rel="noreferrer" target={"_blank"}>
              GitLab
            </a>
          </div>
        </div>
      </div>

      <div className="About">
        "Yoga not only changes the way we see the world, yoga transforms the
        person who sees it. Practice with love and inspiration..."
      </div>
    </div>
  );
};
export default AboutUs;
