import NavigationBar from "@/components/customui/NavigationBar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { fetchProjects } from "@/services/ProjectsService"
import { fetchProjectComponentsByProjectId } from "@/services/ProjectComponentService"
import { Project, ProjectComponent } from "@/types"

const ProjectPage = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [components, setComponents] = useState<Record<number, ProjectComponent[]>>({})
  const [loading, setLoading] = useState(false)

  const handleLoadProjects = async () => {
    setLoading(true)

    // 1. Load all projects
    const { data: projectsData } = await fetchProjects()
    setProjects(projectsData)

    // 2. For each project, fetch its components
    const componentsMap: Record<number, ProjectComponent[]> = {}
    for (const project of projectsData) {
      const comps = await fetchProjectComponentsByProjectId(project.id)
      componentsMap[project.id] = comps
    }

    setComponents(componentsMap)
    setLoading(false)
  }

  return (
    <>
      <NavigationBar />
      <div className="p-4">
        <Button onClick={handleLoadProjects} disabled={loading}>
          {loading ? "Loading..." : "Load Projects"}
        </Button>

        <div className="mt-6">
          {projects.length > 0 ? (
            <ul className="space-y-4">
              {projects.map((proj) => (
                <li key={proj.id} className="border rounded-lg p-4">
                  <h2 className="font-bold text-lg">{proj.name}</h2>
                  <p className="text-sm text-gray-600">{proj.description}</p>

                  <div className="mt-2">
                    <h3 className="font-semibold">Components:</h3>
                    {components[proj.id] && components[proj.id].length > 0 ? (
                      <ul className="list-disc pl-6">
                        {components[proj.id].map((comp) => (
                          <li key={comp.id}>
                            <span className="font-medium">{comp.name}</span> —{" "}
                            {comp.description || "No description"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No components found</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !loading && <p>No projects found</p>
          )}
        </div>
      </div>
    </>
  )
}

export default ProjectPage
