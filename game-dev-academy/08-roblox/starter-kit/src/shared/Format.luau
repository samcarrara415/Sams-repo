--!strict
local Format = {}

-- 950 -> "950", 1234 -> "1.2K", 3400000 -> "3.4M". Kids read short numbers faster.
function Format.short(n: number): string
	local units = { "", "K", "M", "B", "T" }
	local i = 1
	while math.abs(n) >= 1000 and i < #units do
		n /= 1000
		i += 1
	end
	if i == 1 then
		return tostring(math.floor(n))
	end
	local text = string.format("%.1f%s", n, units[i])
	return (text:gsub("%.0(%a)$", "%1"))
end

return Format
