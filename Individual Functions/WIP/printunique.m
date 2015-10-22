function printunique(outarr,fo)

for i = 1:size(outarr)
        line = outarr{i,1};
        fprintf(fo,'%s\n',line);
end
end