import ProjectCard from "../components/ProjectCard";

function BrowseProjects() {

  return (

    <div style={{padding:"40px"}}>

      <h1>Available Projects</h1>

      <div style={{display:"flex", gap:"30px", marginTop:"30px"}}>

        <ProjectCard />
        <ProjectCard />
        <ProjectCard />

      </div>

    </div>

  );
}

export default BrowseProjects;