const Section = ({ id, title, children }) => {
  return (
    <section id={id} className="section">
      <div className="section-content">
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
};

export default Section;
