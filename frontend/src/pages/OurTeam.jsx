import Section from "../components/Section";
import "../styles/Section.css";
import "../styles/OurTeam.css";

const teamMembers = [
  { name: "Member 1", role: "Coordinator", img: "/member1.jpg" },
  { name: "Member 2", role: "Tech Lead", img: "/member2.jpg" },
  { name: "Member 3", role: "HR Manager", img: "/member3.jpg" },
  { name: "Member 4", role: "HR Manager", img: "/member4.jpg" },
];

const OurTeam = () => {
  return (
    <Section id="our-team" title="Meet Our Team">
      <p>Meet the amazing team behind the Placement Cell!</p>
      <div className="team-container">
        {teamMembers.map((member, index) => (
          <div className="team-member" key={index}>
            <img src={member.img} alt={member.name} />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default OurTeam;

