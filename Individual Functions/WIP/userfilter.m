function userfilter(inputfile)


fin = fopen(inputfile,'r');
outputfile = ['filtered_',inputfile];
fout = fopen(outputfile,'wt');


line = fgets(fin);
fprintf(fout,'%s\n',line); % headers added



while (~feof(fin))
    line=fgets(fin);
    user = line(29:46);
    if strfind(user, 'ORANGE')
        fprintf(fout,'%s\n',line);
    elseif strfind(user, 'GREEN')
        fprintf(fout,'%s\n',line);
    elseif strfind(user, 'BLUE')
        fprintf(fout,'%s\n',line);
    end
end
end

















