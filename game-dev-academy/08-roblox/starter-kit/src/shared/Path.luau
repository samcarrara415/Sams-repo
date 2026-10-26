--!strict
-- Enemies are data: { distance along the path }. Position is computed from distance.
-- The server never moves physics parts for enemies; clients draw them (08-roblox/15-performance-and-mobile.md).

export type Path = { points: { Vector3 }, cum: { number }, length: number }

local Path = {}

function Path.new(points: { Vector3 }): Path
	assert(#points >= 2, "a path needs at least 2 points")
	local cum = { 0 }
	for i = 2, #points do
		cum[i] = cum[i - 1] + (points[i] - points[i - 1]).Magnitude
	end
	return { points = points, cum = cum, length = cum[#cum] }
end

-- Reads waypoint parts named "1", "2", "3"... from a folder, in order.
function Path.fromFolder(folder: Instance): Path
	local points = {}
	for i = 1, #folder:GetChildren() do
		local part = folder:FindFirstChild(tostring(i))
		assert(part and part:IsA("BasePart"), `waypoint {i} missing in {folder:GetFullName()}`)
		table.insert(points, part.Position)
	end
	return Path.new(points)
end

function Path.positionAt(path: Path, distance: number): Vector3
	local pts, cum = path.points, path.cum
	if distance <= 0 then
		return pts[1]
	end
	for i = 2, #pts do
		if distance <= cum[i] then
			local t = (distance - cum[i - 1]) / (cum[i] - cum[i - 1])
			return pts[i - 1]:Lerp(pts[i], t)
		end
	end
	return pts[#pts]
end

return Path
