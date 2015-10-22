function [outarr,fo] = getunique()
try

fi = fopen('out_newboxed_1.csv','r');
    fo = fopen(['users_','out_newboxed_1.csv'],'wt');
    line = fgets(fi);
    n=1;
    outarr=[];
    
    while ischar(line)
        line = fgets(fi);
        line = fgets(fi);
        s2=char(line);
        arr=strfind(s2,',');
        brr1 = s2(arr(1):arr(2));
        outarr{n,1} = brr1;
        n=n+1;
    end

end
end